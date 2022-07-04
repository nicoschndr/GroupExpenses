import { TestBed } from '@angular/core/testing';

import { TrackNavService } from './track-nav.service';

describe('TrackNavService', () => {
  let service: TrackNavService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrackNavService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
