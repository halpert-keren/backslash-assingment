/**
 * Base filter interface for extensible filter system
 */

import { Graph } from '../models/graph.model';
import { Route } from '../types/graph.types';

export interface Filter {
  name: string;
  apply(routes: Route[], graph: Graph): Route[];
}
