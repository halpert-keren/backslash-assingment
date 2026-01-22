/**
 * Service for applying filters to routes
 */

import { Graph } from '../models/graph.model';
import { Route, FilterOptions } from '../types/graph.types';
import { Filter } from '../filters/base.filter';
import { PublicStartFilter } from '../filters/public-start.filter';
import { SinkEndFilter } from '../filters/sink-end.filter';
import { VulnerabilityFilter } from '../filters/vulnerability.filter';

export class FilterService {
  private filters: Map<string, Filter>;

  constructor() {
    this.filters = new Map();
    this.registerFilter(new PublicStartFilter());
    this.registerFilter(new SinkEndFilter());
    this.registerFilter(new VulnerabilityFilter());
  }

  /**
   * Register a new filter (for extensibility)
   */
  registerFilter(filter: Filter): void {
    this.filters.set(filter.name, filter);
  }

  /**
   * Apply filters to routes using AND logic
   */
  applyFilters(routes: Route[], graph: Graph, options: FilterOptions): Route[] {
    let filteredRoutes = routes;
    const appliedFilters: string[] = [];

    // Apply each active filter in sequence (AND logic)
    if (options.startFromPublic === true) {
      const filter = this.filters.get('startFromPublic');
      if (filter) {
        filteredRoutes = filter.apply(filteredRoutes, graph);
        appliedFilters.push('startFromPublic');
      }
    }

    if (options.endInSink === true) {
      const filter = this.filters.get('endInSink');
      if (filter) {
        filteredRoutes = filter.apply(filteredRoutes, graph);
        appliedFilters.push('endInSink');
      }
    }

    if (options.hasVulnerability === true) {
      const filter = this.filters.get('hasVulnerability');
      if (filter) {
        filteredRoutes = filter.apply(filteredRoutes, graph);
        appliedFilters.push('hasVulnerability');
      }
    }

    return filteredRoutes;
  }

  /**
   * Get list of applied filter names (for metadata)
   */
  getAppliedFilters(options: FilterOptions): string[] {
    const applied: string[] = [];
    if (options.startFromPublic === true) applied.push('startFromPublic');
    if (options.endInSink === true) applied.push('endInSink');
    if (options.hasVulnerability === true) applied.push('hasVulnerability');
    return applied;
  }
}
