import {
  TAnalyze,
  TAnalyzeOptions,
  TDepMap,
  TEdges,
  TGraph
} from './interface'

export const analyze: TAnalyze = (edges: TEdges, opts: TAnalyzeOptions = {graphs: true, queue: true, check: true, strict: true}) => {
  const _edges = opts.strict ? [...edges].sort() : edges
  const { next, prev } = getHops(_edges)
  if (opts.check) checkLoop(next)

  const sources = getSources(_edges)
  const graphs = opts.graphs ? getGraphs(sources, next) : undefined
  const queue = opts.queue ? getQueue(sources, next, prev) : undefined

  return {
    next,
    prev,
    sources,
    queue,
    graphs
  } as ReturnType<TAnalyze>
}

const pushHop = (deps: TDepMap, a: string, b: string) => {
  if (deps.has(a)) {
    (deps.get(a) as string[]).push(b)
  } else {
    deps.set(a, [b])
  }
}

const getHops = (edges: TEdges): {next: TDepMap, prev: TDepMap} => {
  const next = new Map<string, string[]>()
  const prev = new Map<string, string[]>()

  for (const [from, to] of edges) {
    if (to) {
      pushHop(next, from, to)
      pushHop(prev, to, from)
    }
  }
  return { next, prev }
}

const getSources = (edges: TEdges): string[] => {
  const targets = new Set(edges.map(([,to]) => to))
  return [...new Set(edges.map(([from]) => from))].filter(node => !targets.has(node))
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

const getGraphs = (sources: string[], next: TDepMap): TGraph[] => {
  const graphs: Set<string>[] = []

  for (const source of sources) {
    const nodes = mergeNested(new Set([source]), next)
    const values = [...nodes]
    // A source may reach several graphs at once: they all are one component now.
    const [graph, ...linked] = graphs.filter(_graph => values.some(node => _graph.has(node)))

    if (!graph) {
      graphs.push(nodes)
      continue
    }

    for (const _graph of linked) {
      pushToSet(graph, ..._graph)
      graphs.splice(graphs.indexOf(_graph), 1)
    }
    pushToSet(graph, ...nodes)
  }

  return graphs.map(nodes => ({
    nodes,
    sources: sources.filter(source => nodes.has(source))
  }))
}

export const checkLoop = (next: TDepMap): void => {
  for (const [node, children] of next) {
    const desc = mergeNested(new Set(children), next)
    if (desc.has(node)) {
      throw new Error(`Loop detected: ${[node,...desc.values()]}`)
    }
  }
}

const pushToSet = (set: Set<string>, ...items: string[]): Set<string> => {
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
