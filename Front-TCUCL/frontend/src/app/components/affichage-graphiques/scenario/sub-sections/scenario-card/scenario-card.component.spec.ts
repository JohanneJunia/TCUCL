import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScenarioCardComponent } from './scenario-card.component';

describe('ScenarioCardComponent', () => {
  let component: ScenarioCardComponent;
  let fixture: ComponentFixture<ScenarioCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScenarioCardComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ScenarioCardComponent);
    component = fixture.componentInstance;
    // La carte exige une catégorie en entrée
    fixture.componentRef.setInput('category', {
      id: 1, name: 'Scénario de test', description: 'Description', totalEmission: 0,
      ecartCible: 0, reductionEstimee: 0, posts: [],
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Scénario de test');
  });
});
