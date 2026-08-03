#!/usr/bin/env node

import { Command } from 'commander';
import {
    generateModule,
    generatePage,
    generateComponent,
    generateGuard
} from './generate.js';

const program = new Command();

program
    .name('emma')
    .description('EmmaJS CLI - generador de módulos, páginas, componentes y guards')
    .version('1.0.0');

program
    .command('generate')
    .description('Generate a module, page, component or guard')
    .argument('<type>', 'type: module, page, component, guard')
    .argument('<name>', 'module name or page name or component name or guard name')
    .argument('[moduleName]', 'Module name (optional)')
    .action((type: string, name: string, moduleName?: string) => {
        switch (type) {
            case 'module':
                generateModule(name);
                break;
            case 'page':
                generatePage(moduleName || name, name);
                break;
            case 'component':
                generateComponent(name);
                break;
            case 'guard':
                generateGuard(name);
                break;
            default:
                console.error(`❌ Unknown type: "${type}". Use: module, page, component or guard`);
        }
    });

program.parse();