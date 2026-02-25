# MyGamesFolder

Um board Kanban para organizar jogos usando a API [RAWG](https://rawg.io). Filtre por categoria, ano e estilo, arraste jogos para colunas pessoais e mantenha tudo salvo no navegador.

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 15.2.11.

## Configurar API key RAWG

1. Crie uma conta em [RAWG](https://rawg.io) e obtenha uma API key em [rawg.io/login/?forward=developer](https://rawg.io/login/?forward=developer).
2. Copie `src/environments/environment.example.ts` para `src/environments/environment.ts` e para `src/environments/environment.prod.ts` (ou edite os arquivos existentes).
3. Substitua `YOUR_RAWG_API_KEY` pela sua chave em ambos os arquivos.

Não commite a API key no repositório. O plano gratuito da RAWG permite 20.000 requisições/mês para projetos pessoais.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
