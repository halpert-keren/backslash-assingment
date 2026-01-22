/**
 * Filter for routes that end in sinks (nodes with no outgoing edges)
 */

import { Graph } from '../models/graph.model';
import { Route } from '../types/graph.types';
import { Filter } from './base.filter';

export class SinkEndFilter implements Filter {
  name = 'endInSink';

  apply(routes: Route[], graph: Graph): Route[] {
    return routes.filter(route => {
      const lastNode = route.path[route.path.length - 1];
      return graph.isSink(lastNode);
    });
  }
}
