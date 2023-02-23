import {
  TAnalyze,
  TAnalyzeOptions,
  TDepMap,
  TGraph
} from './interface'

export const analyze: TAnalyze = (edges: [string, string][], opts: TAnalyzeOptions = {graphs: true, queue: true, check: true, strict: true}) => {
  const _edges = opts.strict ? [...edges].sort() : edges
  const { next, prev } = getHops(_edges)
  opts.check && checkLoop(next)

  const sources = getSources(_edges)
  const graphs = opts.graphs ? getGraphs(_edges, sources, next) : undefined
  const queue = opts.queue ? getQueue(sources, next, prev) : undefined

  return {
    next,
    prev,
    sources,
    queue,
    graphs
  } as ReturnType<TAnalyze>
}

const getQueue = (sources: string[], next: TDepMap, prev: TDepMap) => {
  const nodes = new Set()
  const todo = [...sources]
  const batch: Set<string> = new Set()

  for (const [i, node] of todo.entries()) {
    if ((prev.get(node) || []).every((p) => nodes.has(p))) {
      nodes.add(node)
      pushToSet(batch, ...(next.get(node) || []))

    } else {
      pushToSet(batch, node)
    }

    if (i === todo.length - 1) {
      todo.push(...batch.values())
      batch.clear()
    }
  }

  return [...nodes.values()]
}

const getHops = (edges: [string, string][]): {next: TDepMap, prev: TDepMap} => {
  const next = new Map<string, string[]>()
  const prev = new Map<string, string[]>()

  for (const [from, to] of edges) {
    if (next.has(from)) {
      next.get(from)!.push(to)
    } else {
      next.set(from, [to])
    }

    if (prev.has(to)) {
      prev.get(to)!.push(from)
    } else {
      prev.set(to, [from])
    }
  }
  return { next, prev }
}

const getSources = (edges: [string, string][]): string[] => [...new Set(edges.map(([from]) => from))]
  .filter(node => edges.every(([,to]) => to !== node))

const getGraphs = (edges: [string, string][], sources: string[], next: TDepMap) => {
  const graphs: TGraph[] = []

  for (const source of sources) {
    const nodes = mergeNested(new Set([source]), next)
    const values = [...nodes.values()]
    const same = graphs.find(_graph => [..._graph.nodes.values()].some(node => values.includes(node)))

    if (same) {
      same.sources.push(source)
      pushToSet(same.nodes, ...values)
      continue
    }

    graphs.push({nodes, sources: [source]})
  }

  return graphs
}

export const checkLoop = (next: Map<string, string[]>): void => {
  for (const [node, children] of next) {
    const desc = mergeNested(new Set(children), next)
    if (desc.has(node)) {
      throw new Error('Loop detected');
    }
  }
}

const pushToSet = <T extends Set<any>>(set: T, ...items: string[]): T => {
  for (const item of items) {
    set.add(item)
  }
  return set
}

const mergeNested = (nodes: Set<string>, deps: TDepMap): Set<string> => {
  for (const node of nodes) {
    pushToSet(nodes, ...(deps.get(node) || []))
  }
  return nodes
}
