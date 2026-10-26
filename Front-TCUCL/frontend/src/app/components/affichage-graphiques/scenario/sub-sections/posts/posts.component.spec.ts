import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { PostsComponent } from './posts.component';

describe('PostsComponent', () => {
  let component: PostsComponent;
  let fixture: ComponentFixture<PostsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostsComponent],
      // Chart.js a besoin de ses échelles et types de graphiques enregistrés
      providers: [provideCharts(withDefaultRegisterables())],
    }).compileComponents();
    fixture = TestBed.createComponent(PostsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('scenarioName', 'Scénario de test');
    fixture.componentRef.setInput('posts', [
      { name: 'Énergie', color: '#E69F00', value: 100, currentEmission: 120, reduction: 0 },
    ]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('recalcule l’émission d’un poste réglé à 50 %', () => {
    const poste = component.posts[0];
    poste.value = 50;
    component.applyPost(poste);
    expect(component.totalCurrentEmissions).toBe(60);
    expect(component.totalReduction).toBe(60);
  });
});
