export type TDepMap = Map<string, string[]>

export type TAnalyzeOptions = {graphs?: boolean, queue?: boolean, check?: boolean, strict?: boolean}

export type TGraph = {
  nodes: Set<string>
  sources: string[]
}

export type TEdges = ([string, string?] | [string])[]

export type TTopoResult = {
  next: TDepMap
  prev: TDepMap
  sources: string[]
  queue: string[]
  graphs: TGraph[]
}

export type TAnalyze = {
  <O extends TAnalyzeOptions = TAnalyzeOptions>(edges: TEdges, opts: O):
    {
      next: TDepMap
      prev: TDepMap
      sources: string[]
      queue: O extends {queue: true} ? string[] : undefined
      graphs: O extends {graphs: true} ? TGraph[] : undefined
    }
  (edges: TEdges): TTopoResult
}
