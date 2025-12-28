import { TestBed } from '@angular/core/testing';

import { GlobalLeaderboardService } from './global-leaderboard.service';

describe('GlobalLeaderboardService', () => {
  let service: GlobalLeaderboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GlobalLeaderboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
