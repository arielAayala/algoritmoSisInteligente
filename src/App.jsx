import React, { useState, useEffect, useRef } from "react";

// Estados de cada celda
const VACIO = 0;
const INICIO = 1;
const FIN = 2;
const MURO = 3;
const CAMINO = 4;
const VISITADO = 5;

export default function VisualizadorAEstrella() {
	const filas = 25;
	const columnas = 25;

	const [cuadricula, setCuadricula] = useState(
		crearCuadriculaVacia(filas, columnas)
	);
	const [puntajes, setPuntajes] = useState(
		crearCuadriculaPuntajes(filas, columnas)
	);
	const [modo, setModo] = useState("muro");
	const [inicio, setInicio] = useState({ f: 12, c: 5 });
	const [fin, setFin] = useState({ f: 12, c: 20 });
	const [ejecutando, setEjecutando] = useState(false);
	const refsTimeout = useRef([]);

	useEffect(() => reiniciarCuadricula(), []);

	function crearCuadriculaVacia(filas, columnas) {
		return Array(filas)
			.fill()
			.map(() => Array(columnas).fill(VACIO));
	}

	function crearCuadriculaPuntajes(filas, columnas) {
		return Array(filas)
			.fill()
			.map(() => Array(columnas).fill(null));
	}

	function actualizarCelda(fila, col, estado) {
		setCuadricula((q) => {
			const nueva = q.map((r) => [...r]);
			nueva[fila][col] = estado;
			return nueva;
		});
	}

	function actualizarPuntaje(fila, col, g, h, f) {
		setPuntajes((ps) => {
			const nueva = ps.map((r) => [...r]);
			nueva[fila][col] = { g, h, f };
			return nueva;
		});
	}

	function manejarClickCelda(fila, col) {
		if (ejecutando) return;
		if (modo === "inicio") {
			actualizarCelda(inicio.f, inicio.c, VACIO);
			setInicio({ f: fila, c: col });
			actualizarCelda(fila, col, INICIO);
		} else if (modo === "fin") {
			actualizarCelda(fin.f, fin.c, VACIO);
			setFin({ f: fila, c: col });
			actualizarCelda(fila, col, FIN);
		} else {
			const celda = cuadricula[fila][col];
			if (celda === VACIO) actualizarCelda(fila, col, MURO);
			else if (celda === MURO) actualizarCelda(fila, col, VACIO);
		}
	}

	function visualizarAEstrella() {
		setEjecutando(true);
		const { ordenVisitados, camino, gScore, hScore, fScore } = aEstrella(
			cuadricula,
			inicio,
			fin
		);

		ordenVisitados.forEach((pos, idx) => {
			const t = setTimeout(() => {
				if (
					!(pos.f === inicio.f && pos.c === inicio.c) &&
					!(pos.f === fin.f && pos.c === fin.c)
				) {
					actualizarCelda(pos.f, pos.c, VISITADO);
				}
				actualizarPuntaje(
					pos.f,
					pos.c,
					gScore[pos.f][pos.c],
					hScore[pos.f][pos.c],
					fScore[pos.f][pos.c]
				);
			}, idx * 20);
			refsTimeout.current.push(t);
		});

		setTimeout(() => {
			[...camino].reverse().forEach((pos, idx) => {
				const t = setTimeout(() => {
					if (
						!(pos.f === inicio.f && pos.c === inicio.c) &&
						!(pos.f === fin.f && pos.c === fin.c)
					) {
						actualizarCelda(pos.f, pos.c, CAMINO);
					}
					actualizarPuntaje(
						pos.f,
						pos.c,
						gScore[pos.f][pos.c],
						hScore[pos.f][pos.c],
						fScore[pos.f][pos.c]
					);
				}, idx * 50);
				refsTimeout.current.push(t);
			});
			setEjecutando(false);
		}, ordenVisitados.length * 20 + 200);
	}

	function limpiarCuadricula() {
		refsTimeout.current.forEach((t) => clearTimeout(t));
		refsTimeout.current = [];
		setEjecutando(false);
		reiniciarCuadricula();
	}

	function reiniciarCuadricula() {
		setCuadricula(crearCuadriculaVacia(filas, columnas));
		setPuntajes(crearCuadriculaPuntajes(filas, columnas));
		actualizarCelda(inicio.f, inicio.c, INICIO);
		actualizarCelda(fin.f, fin.c, FIN);
	}

	return (
		<div className="p-4">
			<div className="mb-4 flex gap-2">
				<button
					onClick={() => setModo("inicio")}
					className="px-4 py-2 rounded shadow"
					disabled={ejecutando}>
					Establecer Inicio
				</button>
				<button
					onClick={() => setModo("fin")}
					className="px-4 py-2 rounded shadow"
					disabled={ejecutando}>
					Establecer Fin
				</button>
				<button
					onClick={() => setModo("muro")}
					className="px-4 py-2 rounded shadow"
					disabled={ejecutando}>
					Dibujar Muros
				</button>
				<button
					onClick={visualizarAEstrella}
					className="px-4 py-2 rounded bg-blue-500 text-white"
					disabled={ejecutando}>
					Visualizar A*
				</button>
				<button
					onClick={limpiarCuadricula}
					className="px-4 py-2 rounded bg-gray-200"
					disabled={ejecutando}>
					Limpiar
				</button>
			</div>

			<div
				className="grid gap-0.5"
				style={{ gridTemplateColumns: `repeat(${columnas}, minmax(0, 1fr))` }}>
				{cuadricula.map((fila, fi) =>
					fila.map((celda, ci) => {
						const score = puntajes[fi][ci];
						return (
							<div
								key={`${fi}-${ci}`}
								onClick={() => manejarClickCelda(fi, ci)}
								className={`w-8 h-8 relative border text-[8px] leading-tight flex items-start justify-start overflow-hidden
                ${
									celda === VACIO
										? "bg-white"
										: celda === MURO
										? "bg-black"
										: celda === INICIO
										? "bg-green-600"
										: celda === FIN
										? "bg-red-600"
										: celda === VISITADO
										? "bg-yellow-300"
										: "bg-blue-300"
								}`}>
								{score && (
									<div className="absolute top-0 left-0 p-1 text-black">
										<div>f:{score.f}</div>
										<div>g:{score.g}</div>
										<div>h:{score.h}</div>
									</div>
								)}
							</div>
						);
					})
				)}
			</div>
		</div>
	);
}

function aEstrella(cuadricula, inicio, fin) {
	const filas = cuadricula.length;
	const columnas = cuadricula[0].length;
	const monticulo = new MonticuloMinimo();
	const origen = {};
	const gScore = Array(filas)
		.fill()
		.map(() => Array(columnas).fill(Infinity));
	const hScore = Array(filas)
		.fill()
		.map(() => Array(columnas).fill(Infinity));
	const fScore = Array(filas)
		.fill()
		.map(() => Array(columnas).fill(Infinity));
	const ordenVisitados = [];

	gScore[inicio.f][inicio.c] = 0;
	hScore[inicio.f][inicio.c] = heuristica(inicio, fin);
	fScore[inicio.f][inicio.c] = hScore[inicio.f][inicio.c];
	monticulo.push({ pos: inicio, f: fScore[inicio.f][inicio.c] });

	while (!monticulo.isEmpty()) {
		const actual = monticulo.pop().pos;
		if (actual.f === fin.f && actual.c === fin.c) break;
		ordenVisitados.push(actual);

		obtenerVecinos(actual, filas, columnas).forEach((vecino) => {
			if (cuadricula[vecino.f][vecino.c] === MURO) return;

			const movimientoDiagonal = vecino.f !== actual.f && vecino.c !== actual.c;
			const costoMovimiento = movimientoDiagonal ? 14 : 10;

			const tentativa = gScore[actual.f][actual.c] + costoMovimiento;

			if (tentativa < gScore[vecino.f][vecino.c]) {
				origen[`${vecino.f},${vecino.c}`] = actual;
				gScore[vecino.f][vecino.c] = tentativa;
				hScore[vecino.f][vecino.c] = heuristica(vecino, fin) * 10;
				fScore[vecino.f][vecino.c] =
					gScore[vecino.f][vecino.c] + hScore[vecino.f][vecino.c];
				monticulo.push({ pos: vecino, f: fScore[vecino.f][vecino.c] });
			}
		});
	}

	const camino = [];
	let actual = fin;
	while (origen[`${actual.f},${actual.c}`]) {
		camino.push(actual);
		actual = origen[`${actual.f},${actual.c}`];
	}
	return { ordenVisitados, camino, gScore, hScore, fScore };
}

function heuristica(a, b) {
	return Math.abs(a.f - b.f) + Math.abs(a.c - b.c);
}

function obtenerVecinos(pos, filas, columnas) {
	const direcciones = [
		[1, 0],
		[-1, 0],
		[0, 1],
		[0, -1],
		[1, 1],
		[1, -1],
		[-1, 1],
		[-1, -1],
	];
	return direcciones
		.map(([df, dc]) => ({ f: pos.f + df, c: pos.c + dc }))
		.filter((n) => n.f >= 0 && n.f < filas && n.c >= 0 && n.c < columnas);
}

class MonticuloMinimo {
	constructor() {
		this.heap = [];
	}
	push(nodo) {
		this.heap.push(nodo);
		this.bubbleUp();
	}
	pop() {
		if (!this.heap.length) return null;
		const top = this.heap[0];
		const end = this.heap.pop();
		if (this.heap.length) {
			this.heap[0] = end;
			this.sinkDown();
		}
		return top;
	}
	isEmpty() {
		return this.heap.length === 0;
	}
	bubbleUp() {
		let idx = this.heap.length - 1;
		const el = this.heap[idx];
		while (idx > 0) {
			const parent = Math.floor((idx - 1) / 2);
			if (el.f >= this.heap[parent].f) break;
			this.heap[idx] = this.heap[parent];
			idx = parent;
		}
		this.heap[idx] = el;
	}
	sinkDown() {
		let idx = 0,
			length = this.heap.length;
		const el = this.heap[0];
		while (true) {
			let left = 2 * idx + 1,
				right = 2 * idx + 2,
				swap = null;
			if (left < length && this.heap[left].f < el.f) swap = left;
			if (
				right < length &&
				((swap === null && this.heap[right].f < el.f) ||
					(swap !== null && this.heap[right].f < this.heap[left].f))
			)
				swap = right;
			if (!swap) break;
			this.heap[idx] = this.heap[swap];
			idx = swap;
		}
		this.heap[idx] = el;
	}
}
