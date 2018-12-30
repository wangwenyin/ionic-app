import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelBroweComponent } from './model-browe.component';

describe('ModelBroweComponent', () => {
  let component: ModelBroweComponent;
  let fixture: ComponentFixture<ModelBroweComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModelBroweComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModelBroweComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
