//
import fs from "fs/promises";
import { writeFile } from "fs/promises";
import {
  nombresFemeninosOriginales,
  nombresMasculinosOriginales,
  DataApellidos,
} from "./nombres.js";
import { DataLocalidades, DataBarrios } from "./localidades.js";
import { DataModalidadesSecundaria } from "./modalidades.js";
import { DataMaterias } from "./materias.js";

//Relaciones nombre genero
const DataNombresFemeninos = nombresFemeninosOriginales.map((nombre) => ({
  name: nombre,
  gender: "Femenino",
}));
const DataNombresMasculinos = nombresMasculinosOriginales.map((nombre) => ({
  name: nombre,
  gender: "Masculino",
}));

//Array de apellidos

//falta formular, aqui iran las unidades educativas, diferenciando entre primaria, secundario y terciario
const DataEstablecimientos = [];

for (let i = 0; i < 10000; i++) {
  const randomType = Math.floor(Math.random() * 3); // Genera un número aleatorio entre 0 y 2
  let type;

  if (randomType === 0) {
    type = "Primario";
  } else if (randomType === 1) {
    type = "Secundario";
  } else {
    type = "Terciario";
  }

  const establecimiento = {
    name: `ESTABLECIMIENTO ${i + 1}`,
    type: type,
    // Agrega aquí la lógica para asociar edades y alumnos según el tipo de establecimiento si es necesario.
  };

  DataEstablecimientos.push(establecimiento);
}

// Ahora DataEstablecimientos contiene 10,000 unidades educativas con tipos aleatorios.

function obtenerElementoAleatorio(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generarDNIaleatorio(usedDNIs) {
  let dni;
  do {
    dni = Math.floor(100000000 + Math.random() * 900000000);
  } while (usedDNIs.has(dni));
  usedDNIs.add(dni);
  return dni;
}

function randomNumbers(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generarEdadAleatoria(nivel) {
  let edadMinima, edadMaxima;
  if (nivel === "Primaria") {
    edadMinima = 6;
    edadMaxima = 12; // 6 años de primaria
  } else if (nivel === "Secundaria") {
    edadMinima = 13; // Inicio de secundaria
    edadMaxima = 18; // Fin de secundaria
  } else {
    edadMinima = 18; // Inicio de terciario
    edadMaxima = 60;
  }
  let edadAleatoria = randomNumbers(edadMinima, edadMaxima);
  return edadAleatoria;
}

function obtenerBarrioAleatorio(localidadName) {
  const barrios = DataBarrios[localidadName] || [];
  return barrios.length > 0
    ? obtenerElementoAleatorio(barrios).name
    : localidadName;
}

function generarDomicilio(localidadName) {
  const domicilio = { calle: `Calle ${Math.floor(Math.random() * 100) + 1}` };
  if (localidadName === "Formosa Capital") {
    const tiposDomicilio = ["Edificio", "Vivienda", "Casa"];
    const tipo = obtenerElementoAleatorio(tiposDomicilio);

    if (tipo === "Edificio") {
      domicilio.tipo = "Edificio";
      domicilio.piso = Math.floor(Math.random() * 20) + 1;
      domicilio.depto = Math.floor(Math.random() * 10) + 1;
    } else if (tipo === "Vivienda") {
      domicilio.tipo = "Vivienda";
      domicilio.manzana = Math.floor(Math.random() * 20) + 1;
      domicilio.casa = Math.floor(Math.random() * 100) + 1;
    } else {
      domicilio.tipo = "Casa";
      domicilio.casa = Math.floor(Math.random() * 100) + 1;
    }
    domicilio.barrio = obtenerBarrioAleatorio(localidadName);
  } else {
    domicilio.tipo = "Casa";
    domicilio.casa = Math.floor(Math.random() * 100) + 1;
    domicilio.barrio = obtenerBarrioAleatorio(localidadName);
  }
  return domicilio;
}

function generarAlumno(usedDNIs) {
  const nombreMasculino = obtenerElementoAleatorio(DataNombresMasculinos);
  const nombreFemenino = obtenerElementoAleatorio(DataNombresFemeninos);

  const nombre =
    Math.random() < 0.5 ? nombreMasculino.name : nombreFemenino.name;

  const genero = nombre === nombreMasculino.name ? "Masculino" : "Femenino";

  const apellido = obtenerElementoAleatorio(DataApellidos);
  const localidad = obtenerElementoAleatorio(DataLocalidades);
  const dni = generarDNIaleatorio(usedDNIs);

  const nivel =
    Math.random() < 0.3
      ? "Terciario"
      : Math.random() < 0.5
      ? "Primaria"
      : "Secundaria";

  const edad = generarEdadAleatoria(nivel);

  const grado = Math.floor(Math.random() * (nivel === "Primaria" ? 6 : 7)) + 1;
  const gradoAño = nivel === "Primaria" ? "Grado" : "Año";
  const modalidad =
    nivel === "Secundaria" &&
    grado > 3 &&
    obtenerElementoAleatorio(DataModalidadesSecundaria);

  const cantidadMaterias =
    nivel === "Primaria" ? 8 : nivel === "Secundaria" ? 12 : 8;

  const notas = {};
  for (let j = 0; j < cantidadMaterias; j++) {
    notas[`${DataMaterias[nivel][j].name}`] =
      Math.floor(Math.random() * 10) + 1;
  }

  const establecimiento = {
    codigo: nivel === "Primaria" ? 102 : nivel === "Secundaria" ? 103 : 115,
    nombre: `Escuela ${dni}`,
  };

  const domicilio = generarDomicilio(localidad.name);

  return {
    _id: dni,
    nombres: nombre,
    apellidos: apellido,
    genero: genero,
    localidad: localidad,
    domicilio: domicilio,
    edad: edad,
    nivel: nivel,
    [gradoAño]: grado,
    modalidad: modalidad,
    notas: notas,
    establecimiento: establecimiento,
  };
}

async function guardarAlumnos() {
  const usedDNIs = new Set();
  const alumnos = [];

  for (let i = 0; i < 10000; i++) {
    alumnos.push(generarAlumno(usedDNIs));
  }

  try {
    await fs.writeFile("alumnos.json", JSON.stringify(alumnos, null, 2));
    console.log(
      "Los documentos JSON de los alumnos se han generado y guardado exitosamente en el archivo 'alumnos.json'."
    );
  } catch (error) {
    console.error("Ocurrió un error al guardar los alumnos:", error.message);
  }
}

guardarAlumnos();
