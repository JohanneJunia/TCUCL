package tcucl.back_tcucl.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tcucl.back_tcucl.dto.OutilSuiviDto;
import tcucl.back_tcucl.dto.OutilSuiviResponseDto;
import tcucl.back_tcucl.dto.SyntheseEGESResultatDto;
import tcucl.back_tcucl.entity.Annee;
import tcucl.back_tcucl.entity.Trajectoire;
import tcucl.back_tcucl.repository.AnneeRepository;
import tcucl.back_tcucl.repository.TrajectoireRepository;
import tcucl.back_tcucl.service.OutilSuiviService;
import tcucl.back_tcucl.service.SyntheseEGESService;

import java.util.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@Transactional(readOnly = true)
public class OutilSuiviServiceImpl implements OutilSuiviService {
    private static final Logger log = LoggerFactory.getLogger(OutilSuiviServiceImpl.class);
    private final AnneeRepository anneeRepository;
    private final SyntheseEGESService syntheseEGESService;
    private final TrajectoireRepository trajectoireRepository;

    public OutilSuiviServiceImpl(AnneeRepository anneeRepository,
                                 SyntheseEGESService syntheseEGESService,
                                 TrajectoireRepository trajectoireRepository) {
        this.anneeRepository = anneeRepository;
        this.syntheseEGESService = syntheseEGESService;
        this.trajectoireRepository = trajectoireRepository;
    }
    @Override
    public OutilSuiviResponseDto loadForEntite(Long entiteId) {
        log.info("[OutilSuivi] loadForEntite exécuté pour entiteId={}", entiteId);
        List<String> warnings = new ArrayList<>();
        Map<Integer, List<String>> issuesByYear = new LinkedHashMap<>();

        List<Annee> annees = anneeRepository.findByEntiteId(entiteId);
        if (annees.isEmpty()) {
            warnings.add("Aucune donnée annuelle trouvée pour cette entité.");
            return new OutilSuiviResponseDto(null, buildMockData(entiteId), warnings, issuesByYear);
        }

        SortedSet<Integer> availableYears = new TreeSet<>();
        annees.forEach(a -> availableYears.add(a.getAnneeValeur()));

        Trajectoire trajectoire = trajectoireRepository.findFirstByEntite_IdOrderByIdDesc(entiteId).orElse(null);
        Integer refYear = trajectoire != null ? trajectoire.getReferenceYear() : (availableYears.isEmpty() ? null : availableYears.first());
        Integer targetYear = trajectoire != null ? trajectoire.getTargetYear() : (availableYears.isEmpty() ? null : availableYears.last());
        Float targetPct = trajectoire != null ? trajectoire.getTargetPercentage() : null;

        SortedSet<Integer> yearsSet = new TreeSet<>();
        if (refYear != null && targetYear != null && targetYear >= refYear) {
            for (int y = refYear; y <= targetYear; y++) {
                yearsSet.add(y);
            }
        } else {
            yearsSet.addAll(availableYears);
        }

        List<Integer> years = new ArrayList<>(yearsSet);
        Collections.sort(years);

        Map<String, Float> baselineParPoste = new LinkedHashMap<>();
        Float baselineTotal = null;
        if (refYear != null && availableYears.contains(refYear)) {
            try {
                SyntheseEGESResultatDto base = syntheseEGESService.getSyntheseEGESResultat(entiteId, refYear);
                baselineTotal = base != null ? base.getBilanCarboneTotalParUsager() : null;
                if (baselineTotal != null && !Float.isFinite(baselineTotal)) {
                    baselineTotal = null;
                }
                baselineParPoste = extractPosteParUsager(base);
                if (base != null && (base.getEffectifTotal() == null || base.getEffectifTotal() <= 0)) {
                    warnings.add("Année de référence " + refYear + " : effectifs non renseignés, objectifs par usager non calculables.");
                }
            } catch (Exception ex) {
                warnings.add("Impossible de calculer la référence " + refYear + " : " + ex.getMessage());
            }
        } else if (refYear != null) {
            warnings.add("Année de référence " + refYear + " introuvable dans les données.");
        }

        List<String> postes = getPostesLabels();
        List<Float> objectif = new ArrayList<>();
        List<Float> realise = new ArrayList<>();
        Map<Integer, List<Float>> postesObjectifParAn = new LinkedHashMap<>();
        Map<Integer, List<Float>> postesRealiseParAn  = new LinkedHashMap<>();
        Map<Integer, Map<String, Float>> indicateursParAn = new LinkedHashMap<>();
        List<Float> globalTotals = new ArrayList<>();

        for (Integer year : years) {
            SyntheseEGESResultatDto synth = null;
            if (availableYears.contains(year)) {
                try {
                    synth = syntheseEGESService.getSyntheseEGESResultat(entiteId, year);
                } catch (Exception ex) {
                    warnings.add("Erreur lors du calcul de l'année " + year + " : " + ex.getMessage());
                    issuesByYear.computeIfAbsent(year, y -> new ArrayList<>()).add("Calcul impossible : " + ex.getMessage());
                }
            }

            Float reaVal = synth != null ? synth.getBilanCarboneTotalParUsager() : null;
            if (reaVal != null && !Float.isFinite(reaVal)) {
                reaVal = null;
            }
            realise.add(reaVal);
            postesRealiseParAn.put(year, extractPosteParUsagerList(synth));
            Map<String, Float> yearIndicators = new LinkedHashMap<>();
            if (synth != null) {
                if (synth.getSurfaceTotaleBatiments() != null) {
                    yearIndicators.put("surfaceTotaleBatiments", synth.getSurfaceTotaleBatiments());
                }
                if (synth.getConsoEnergieFinaleParM2() != null) {
                    yearIndicators.put("consoEnergieFinaleParM2", synth.getConsoEnergieFinaleParM2());
                }
                if (synth.getConsoEnergiePrimaireParM2() != null) {
                    yearIndicators.put("consoEnergiePrimaireParM2", synth.getConsoEnergiePrimaireParM2());
                }
                if (synth.getIntensiteCarboneParM2() != null) {
                    yearIndicators.put("intensiteCarboneParM2", synth.getIntensiteCarboneParM2());
                }
                if (synth.getBilanCarboneTotalParM2() != null) {
                    yearIndicators.put("bilanCarboneTotalParM2", synth.getBilanCarboneTotalParM2());
                }
                if (synth.getEffectifTotal() != null) {
                    yearIndicators.put("effectifTotal", synth.getEffectifTotal().floatValue());
                }
                if (synth.getBilanCarboneTotalParUsager() != null) {
                    yearIndicators.put("bilanCarboneTotalParUsager", synth.getBilanCarboneTotalParUsager());
                }
            }
            indicateursParAn.put(year, yearIndicators);
            Float gTotal = synth != null ? synth.getBilanCarboneTotalGlobal() : null;
            if (gTotal != null && !Float.isFinite(gTotal)) {
                gTotal = null;
            }
            globalTotals.add(gTotal);

            Float obj = computeObjectif(year, refYear, targetYear, targetPct, baselineTotal);
            objectif.add(obj);
            postesObjectifParAn.put(year, computePosteObjectifList(year, refYear, targetYear, trajectoire, baselineParPoste));

            if (synth != null && (synth.getEffectifTotal() == null || synth.getEffectifTotal() <= 0)) {
                issuesByYear.computeIfAbsent(year, y -> new ArrayList<>()).add("Effectifs non renseignés : valeurs par usager indisponibles.");
            } else if (reaVal == null) {
                issuesByYear.computeIfAbsent(year, y -> new ArrayList<>()).add("Aucune donnée validée pour cette année.");
            }
        }

        OutilSuiviDto realDto = new OutilSuiviDto(entiteId, years, objectif, realise, postes, postesObjectifParAn, postesRealiseParAn, indicateursParAn, globalTotals);
        OutilSuiviResponseDto response = new OutilSuiviResponseDto(realDto, buildMockData(entiteId), warnings, issuesByYear);
        log.info("[OutilSuivi] loadForEntite terminé pour entiteId={} ({} années)", entiteId, years.size());
        return response;
    }

    private List<String> getPostesLabels() {
        return Arrays.asList(
                "Énergie",
                "Déplacements domicile-travail",
                "Déplacements professionnels",
                "Bâtiments et mobilier",
                "Numérique",
                "Achats et restauration",
                "Déchets",
                "Autres immobilisations",
                "Émissions fugitives"
        );
    }

    private Float computeObjectif(Integer year, Integer refYear, Integer targetYear, Float targetPct, Float baselineTotal) {
        if (baselineTotal == null || refYear == null || targetYear == null || targetYear.equals(refYear)) return null;
        float target = targetPct != null ? (baselineTotal * (1f - (targetPct / 100f))) : baselineTotal;
        float progress = (float) Math.min(1d, Math.max(0d, (year - refYear) / (double) (targetYear - refYear)));
        return baselineTotal - (baselineTotal - target) * progress;
    }

    private List<Float> computePosteObjectifList(Integer year, Integer refYear, Integer targetYear, Trajectoire trajectoire, Map<String, Float> baselineParPoste) {
        List<String> postes = getPostesLabels();
        Map<String, Integer> reductions = trajectoire != null ? trajectoire.getPosteReductions() : Collections.emptyMap();
        List<Float> result = new ArrayList<>(postes.size());
        for (String p : postes) {
            Float base = baselineParPoste.get(p);
            if (base == null || refYear == null || targetYear == null || targetYear.equals(refYear)) {
                result.add(null);
                continue;
            }
            int pct = reductions.getOrDefault(normalizePosteId(p), trajectoire != null && trajectoire.getTargetPercentage() != null ? Math.round(trajectoire.getTargetPercentage()) : 0);
            float target = base * (1f - (pct / 100f));
            float progress = (float) Math.min(1d, Math.max(0d, (year - refYear) / (double) (targetYear - refYear)));
            result.add(base - (base - target) * progress);
        }
        return result;
    }

    private String normalizePosteId(String libelle) {
        return libelle.toLowerCase(Locale.ROOT)
                .replace("é", "e").replace("è", "e").replace("ê", "e")
                .replace("à", "a").replace("â", "a")
                .replace("ç", "c")
                .replaceAll("[^a-z0-9]+", "-");
    }

    private Map<String, Float> extractPosteParUsager(SyntheseEGESResultatDto synth) {
        Map<String, Float> map = new LinkedHashMap<>();
        if (synth == null) return map;
        if (synth.getEffectifTotal() == null || synth.getEffectifTotal() <= 0) {
            for (String p : getPostesLabels()) {
                map.put(p, null);
            }
            return map;
        }
        map.put("Énergie", synth.getEnergieParUsager());
        map.put("Déplacements domicile-travail", synth.getMobiliteDomicileTravailParUsager());
        Float autreMob = synth.getAutreMobiliteFrParUsager();
        Float mobInt = synth.getMobiliteInternationalParUsager();
        Float deplacementPro = (autreMob != null || mobInt != null) ? safe(autreMob) + safe(mobInt) : null;
        map.put("Déplacements professionnels", deplacementPro);
        map.put("Bâtiments et mobilier", synth.getBatimentParkingParUsager());
        map.put("Numérique", synth.getNumeriqueParUsager());
        map.put("Achats et restauration", synth.getAchatParUsager());
        map.put("Déchets", synth.getDechetParUsager());
        map.put("Autres immobilisations", synth.getAutreImmobilisationParUsager());
        map.put("Émissions fugitives", synth.getEmissionFugitivesParUsager());
        return map;
    }

    private List<Float> extractPosteParUsagerList(SyntheseEGESResultatDto synth) {
        List<String> postes = getPostesLabels();
        Map<String, Float> map = extractPosteParUsager(synth);
        List<Float> list = new ArrayList<>(postes.size());
        for (String p : postes) {
            list.add(map.getOrDefault(p, null));
        }
        return list;
    }

    private float safe(Float v) { return v != null ? v : 0f; }

    private OutilSuiviDto buildMockData(Long entiteId) {
        // Mocks alignés sur l'ancien comportement, conservés pour le toggle front
        List<Integer> years = Arrays.asList(2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030);
        List<Float> objectif = Arrays.asList(780f, 750f, 720f, 680f, 650f, 620f, 590f, 589f, 550f, 520f, 490f, 460f);
        List<Float> realise  = Arrays.asList(780f, 740f, 710f, 700f, 670f, 700f, 600f, 580f, 600f, 489f, 500f, 460f);

        List<String> postes = getPostesLabels();
        Map<Integer, List<Float>> postesObjectifParAn = new LinkedHashMap<>();
        Map<Integer, List<Float>> postesRealiseParAn  = new LinkedHashMap<>();
        Map<Integer, Map<String, Float>> indicateursParAn = new LinkedHashMap<>();

        Map<Integer, float[]> objScen = new HashMap<>();
        objScen.put(2019, new float[]{12, 165, 245, 290, 95, 45, 18, 15, 65});
        objScen.put(2020, new float[]{9, 125, 180, 220, 140, 55, 22, 12, 95});
        objScen.put(2022, new float[]{4, 95, 135, 175, 105, 75, 8, 18, 85});
        objScen.put(2024, new float[]{6, 70, 110, 145, 85, 50, 14, 35, 60});
        objScen.put(2026, new float[]{2, 55, 95, 130, 70, 42, 11, 28, 50});
        objScen.put(2028, new float[]{1, 45, 80, 110, 60, 35, 9, 22, 42});
        objScen.put(2030, new float[]{0, 35, 65, 90, 50, 28, 6, 18, 35});

        Map<Integer, float[]> reaScen = new HashMap<>();
        reaScen.put(2019, new float[]{14, 190, 280, 335, 110, 52, 20, 18, 75});
        reaScen.put(2020, new float[]{11, 140, 195, 240, 155, 62, 25, 15, 110});
        reaScen.put(2022, new float[]{5, 105, 150, 195, 115, 88, 10, 22, 95});
        reaScen.put(2024, new float[]{7, 78, 125, 160, 95, 58, 16, 42, 68});
        reaScen.put(2026, new float[]{3, 62, 108, 145, 78, 48, 13, 32, 56});
        reaScen.put(2028, new float[]{2, 50, 88, 120, 68, 40, 11, 26, 47});
        reaScen.put(2030, new float[]{1, 40, 72, 100, 55, 32, 8, 21, 38});

        for (Integer y : years) {
            float[] obj = objScen.get(y);
            float[] rea = reaScen.get(y);
            if (obj == null) obj = new float[]{12.0f, 95.0f, 181.2f, 234.4f, 89.0f, 41.0f, 22.0f, 5.5f, 76.9f};
            if (rea == null) rea = new float[]{ 9.5f,113.2f, 178.5f, 315.2f,108.7f, 47.6f, 18.0f,11.8f, 50.5f};

            postesObjectifParAn.put(y, toList(obj));
            postesRealiseParAn.put(y, toList(rea));
            Map<String, Float> mockInd = new LinkedHashMap<>();
            mockInd.put("surfaceTotaleBatiments", 25000f);
            mockInd.put("consoEnergieFinaleParM2", 145f);
            mockInd.put("consoEnergiePrimaireParM2", 210f);
            mockInd.put("intensiteCarboneParM2", 28f);
            mockInd.put("bilanCarboneTotalParM2", 48f);
            mockInd.put("effectifTotal", 3200f);
            indicateursParAn.put(y, mockInd);
        }

        List<Float> globalTotals = Arrays.asList(12.2f, 11.8f, 13f, 10.5f, 10.0f, 14f, 8.9f, 8.3f, 7.8f, 7.3f, 6.8f, 6.2f);
        return new OutilSuiviDto(entiteId, years, objectif, realise, postes, postesObjectifParAn, postesRealiseParAn, indicateursParAn, globalTotals);
    }

    private List<Float> toList(float[] arr) {
        List<Float> list = new ArrayList<>(arr.length);
        for (float v : arr) list.add(v);
        return list;
    }
}
