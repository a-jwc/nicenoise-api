import { Test, TestingModule } from '@nestjs/testing';
import { SoundsController } from './sounds.controller';

describe('SoundsController', () => {
  let controller: SoundsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SoundsController],
    }).compile();

    controller = module.get<SoundsController>(SoundsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
