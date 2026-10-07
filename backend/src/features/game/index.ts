// Public API của feature game: những gì app.ts cần để nối dây.
// GameService cần một BranchLookup (app.ts truyền BranchService của feature branch vào).
export { GameCategoryController } from './game-category.controller';
export { GameCategoryRepository } from './game-category.repository';
export { createGameCategoryRouter } from './game-category.routes';
export { GameCategoryService } from './game-category.service';
export { GameController } from './game.controller';
export { GameRepository } from './game.repository';
export { createGameRouter } from './game.routes';
export { GameService } from './game.service';
export type { BranchLookup } from './game.types';
