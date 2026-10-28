/**
 * Módulo de estadísticas y catálogo académico de Pilas!
 * Calcula dinámicamente el número de mallas y herramientas desde `src/data/suite.json`.
 */
import suiteData from '../data/suite.json';

export interface MallaItem {
  id: string;
  name: string;
  faculty: string;
  semesters: number;
}

export interface ToolItem {
  id: string;
  name: string;
  tag: string;
  icon: string;
  desc: string;
}

export const MALLAS: MallaItem[] = suiteData.mallas;
export const TOOLS: ToolItem[] = suiteData.tools;

export const ACADEMIC_STATS = {
  mallasCount: MALLAS.length,
  toolsCount: TOOLS.length,
  mallasLabel: `${MALLAS.length} mallas`,
  toolsLabel: `${TOOLS.length} herramientas`,
};
