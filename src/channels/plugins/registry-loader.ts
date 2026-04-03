import type { PluginChannelRegistration, PluginRegistry } from "../../plugins/registry.js";
import {
  getActivePluginChannelRegistry,
  getActivePluginChannelRegistryVersion,
} from "../../plugins/runtime.js";
import type { ChannelId } from "./types.js";

type ChannelRegistryValueResolver<TValue> = (
  entry: PluginChannelRegistration,
) => TValue | undefined;

export function createChannelRegistryLoader<TValue>(
  resolveValue: ChannelRegistryValueResolver<TValue>,
): (id: ChannelId) => Promise<TValue | undefined> {
  const cache = new Map<ChannelId, TValue>();
  let lastRegistry: PluginRegistry | null = null;
  let lastVersion = -1;

  return async (id: ChannelId): Promise<TValue | undefined> => {
    const registry = getActivePluginChannelRegistry();
    const version = getActivePluginChannelRegistryVersion();
    if (registry !== lastRegistry || version !== lastVersion) {
      cache.clear();
      lastRegistry = registry;
      lastVersion = version;
    }
    const cached = cache.get(id);
    if (cached) {
      return cached;
    }
    const pluginEntry = registry?.channels.find((entry) => entry.plugin.id === id);
    if (!pluginEntry) {
      return undefined;
    }
    const resolved = resolveValue(pluginEntry);
    if (resolved) {
      cache.set(id, resolved);
    }
    return resolved;
  };
}
