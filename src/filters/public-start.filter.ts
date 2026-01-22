/**
 * Filter for routes that start from public services
 */

import { Graph } from '../models/graph.model';
import { Route } from '../types/graph.types';
import { Filter } from './base.filter';

export class PublicStartFilter implements Filter {
  name = 'startFromPublic';

  apply(routes: Route[], graph: Graph): Route[] {
    return routes.filter(route => {
      const firstNode = route.path[0];
      const node = graph.getNode(firstNode);
      return node?.publicExposed === true;
    });
  }
}
