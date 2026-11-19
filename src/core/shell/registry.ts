import type { CommandDefinition } from './types';

/** Holds all available commands. Commands register themselves via `register`. */
export class CommandRegistry {
  private commands = new Map<string, CommandDefinition>();

  register(def: CommandDefinition): this {
    this.commands.set(def.name, def);
    return this;
  }

  get(name: string): CommandDefinition | undefined {
    return this.commands.get(name);
  }

  has(name: string): boolean {
    return this.commands.has(name);
  }

  list(): CommandDefinition[] {
    return [...this.commands.values()].sort((a, b) => a.name.localeCompare(b.name));
  }

  names(): string[] {
    return this.list().map((c) => c.name);
  }
}
