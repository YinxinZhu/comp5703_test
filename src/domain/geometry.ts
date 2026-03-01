import { z } from 'zod'
import type { Point, PolygonGeometry } from './types.js'

export const PointSchema = z.tuple([z.number(), z.number()])

export const PolygonSchema = z.object({
  type: z.literal('Polygon'),
  coordinates: z.array(PointSchema).min(3)
})

export function ensureClosedRing(points: readonly Point[]): Point[] {
  if (points.length < 3) {
    throw new Error('Polygon requires at least 3 points.')
  }

  const first = points[0]
  const last = points[points.length - 1]
  if (first[0] === last[0] && first[1] === last[1]) {
    return [...points]
  }

  return [...points, first]
}

export function calculatePolygonArea(points: readonly Point[]): number {
  const ring = ensureClosedRing(points)
  let sum = 0

  for (let i = 0; i < ring.length - 1; i += 1) {
    const [x1, y1] = ring[i]
    const [x2, y2] = ring[i + 1]
    sum += x1 * y2 - x2 * y1
  }

  return Math.abs(sum) / 2
}

export function calculatePolygonPerimeter(points: readonly Point[]): number {
  const ring = ensureClosedRing(points)
  let length = 0

  for (let i = 0; i < ring.length - 1; i += 1) {
    const [x1, y1] = ring[i]
    const [x2, y2] = ring[i + 1]
    const dx = x2 - x1
    const dy = y2 - y1
    length += Math.sqrt(dx * dx + dy * dy)
  }

  return length
}

export function parsePolygonGeometry(input: unknown): PolygonGeometry {
  return PolygonSchema.parse(input)
}
