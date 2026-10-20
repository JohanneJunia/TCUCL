package tcucl.back_tcucl.manager.impl.onglet;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import tcucl.back_tcucl.dto.onglet.emissionFugitive.MachineEmissionFugitiveDto;
import tcucl.back_tcucl.dto.onglet.emissionFugitive.EmissionFugitiveOngletDto;
import tcucl.back_tcucl.entity.onglet.batiment.BatimentImmobilisationMobilierOnglet;
import tcucl.back_tcucl.entity.onglet.emissionFugitive.EmissionFugitiveOnglet;
import tcucl.back_tcucl.entity.onglet.emissionFugitive.MachineEmissionFugitive;
import tcucl.back_tcucl.entity.onglet.emissionFugitive.enums.EnumEmissionFugitive_TypeMachine;
import tcucl.back_tcucl.exceptionPersonnalisee.ElementNontrouveException;
import tcucl.back_tcucl.exceptionPersonnalisee.OngletNonTrouveIdException;
import tcucl.back_tcucl.exceptionPersonnalisee.ValidationCustomException;
import tcucl.back_tcucl.manager.EmissionFugitiveOngletManager;
import tcucl.back_tcucl.repository.onglet.EmissionFugitiveOngletRepository;

import java.util.Set;

@Component
public class EmissionFugitiveOngletManagerImpl implements EmissionFugitiveOngletManager {

    @Autowired
    private Validator validator;
    
    
    private final EmissionFugitiveOngletRepository emissionFugitiveOngletRepository;

    public EmissionFugitiveOngletManagerImpl(EmissionFugitiveOngletRepository emissionFugitiveOngletRepository) {
        this.emissionFugitiveOngletRepository = emissionFugitiveOngletRepository;
    }

    @Override
    public EmissionFugitiveOnglet getEmissionFugitiveOngletById(Long ongletId) {
        return emissionFugitiveOngletRepository.findById(ongletId)
                .orElseThrow(() -> new OngletNonTrouveIdException("EmissionFugitiveOnglet", ongletId));
    }

    @Override
    public MachineEmissionFugitive getMachineById(Long ongletId, Long machineId) {
        EmissionFugitiveOnglet emissionFugitiveOnglet = getEmissionFugitiveOngletById(ongletId);
        return emissionFugitiveOnglet.getMachinesEmissionFugitive().stream()
                .filter(m -> m.getId().equals(machineId))
                .findFirst()
                .orElseThrow(() -> new ElementNontrouveException("MachineEmissionFugitive",machineId));
    }

    @Override
    public void updateEmissionFugitiveOnglet(Long ongletId, EmissionFugitiveOngletDto emissionFugitiveOngletDto) {
        EmissionFugitiveOnglet emissionFugitiveOnglet = getEmissionFugitiveOngletById(ongletId);

        if (emissionFugitiveOngletDto.getEstTermine() != null) {
            emissionFugitiveOnglet.setEstTermine(emissionFugitiveOngletDto.getEstTermine());
        }

        if (emissionFugitiveOngletDto.getNote() != null) {
            emissionFugitiveOnglet.setNote(emissionFugitiveOngletDto.getNote());
        }

        if (emissionFugitiveOngletDto.getMachinesEmissionFugitive() != null) {
            emissionFugitiveOnglet.getMachinesEmissionFugitive().clear();
            for (MachineEmissionFugitiveDto machineDto : emissionFugitiveOngletDto.getMachinesEmissionFugitive()) {
                emissionFugitiveOnglet.ajouterMachineViaDto(machineDto);
            }
        }
        
        
        Set<ConstraintViolation<EmissionFugitiveOnglet>> violations = validator.validate(emissionFugitiveOnglet);
        if(!violations.isEmpty()) {
            throw new ValidationCustomException(violations);
        }
        emissionFugitiveOngletRepository.save(emissionFugitiveOnglet);
    }

    @Override
    public void ajouterMachine(Long ongletId, MachineEmissionFugitiveDto machineEmissionFugitiveDto) {
        EmissionFugitiveOnglet emissionFugitiveOnglet = getEmissionFugitiveOngletById(ongletId);
        emissionFugitiveOnglet.ajouterMachineViaDto(machineEmissionFugitiveDto);
        Set<ConstraintViolation<EmissionFugitiveOnglet>> violations = validator.validate(emissionFugitiveOnglet);
        if(!violations.isEmpty()) {
            throw new ValidationCustomException(violations);
        }
        emissionFugitiveOngletRepository.save(emissionFugitiveOnglet);
    }


    @Override
    public void supprimerMachineFromOnglet(Long ongletId, Long machineId) {
        EmissionFugitiveOnglet emissionFugitiveOnglet = getEmissionFugitiveOngletById(ongletId);

        // Trouver la machine à supprimer
        MachineEmissionFugitive machineASupprimer = emissionFugitiveOnglet.getMachinesEmissionFugitive()
                .stream()
                .filter(v -> v.getId().equals(machineId))
                .findFirst()
                .orElseThrow(() -> new ElementNontrouveException("MachineEmissionFugitive",machineId));

        // Retirer de la liste
        emissionFugitiveOnglet.getMachinesEmissionFugitive().remove(machineASupprimer);

        // Sauvegarder l'onglet
        Set<ConstraintViolation<EmissionFugitiveOnglet>> violations = validator.validate(emissionFugitiveOnglet);
        if(!violations.isEmpty()) {
            throw new ValidationCustomException(violations);
        }
        emissionFugitiveOngletRepository.save(emissionFugitiveOnglet);
    }

    @Override
    public void updateMachinePartiel(Long ongletId, Long machineId, MachineEmissionFugitiveDto dto) {
        EmissionFugitiveOnglet emissionFugitiveOnglet = getEmissionFugitiveOngletById(ongletId);

        MachineEmissionFugitive machine = emissionFugitiveOnglet.getMachinesEmissionFugitive().stream()
                .filter(m -> m.getId().equals(machineId))
                .findFirst()
                .orElseThrow(() -> new ElementNontrouveException("MachineEmissionFugitive",machineId));


        if (dto.getDescriptionMachine() != null) {
            machine.setDescriptionMachine(dto.getDescriptionMachine());
        }
        if (dto.getTypeFluide() != null) {
            machine.setTypeFluide(dto.getTypeFluide());
        }
        if (dto.getQuantiteFluideKg() != null) {
            machine.setQuantiteFluideKg(dto.getQuantiteFluideKg());
        }
        if (dto.getTauxDeFuiteConnu() != null) {
            machine.setTauxDeFuiteConnu(dto.getTauxDeFuiteConnu());
            if (Boolean.TRUE.equals(dto.getTauxDeFuiteConnu())) {
                machine.setTypeMachine(EnumEmissionFugitive_TypeMachine.NA);
            } else {
                machine.setTauxDeFuite(null);
            }
        }
        if (dto.getTauxDeFuite() != null && Boolean.TRUE.equals(machine.getTauxDeFuiteConnu())) {
            machine.setTauxDeFuite(dto.getTauxDeFuite());
        }
        if (dto.getTypeMachine() != null && Boolean.FALSE.equals(machine.getTauxDeFuiteConnu())) {
            machine.setTypeMachine(dto.getTypeMachine());
        }

        Set<ConstraintViolation<EmissionFugitiveOnglet>> violations = validator.validate(emissionFugitiveOnglet);
        if(!violations.isEmpty()) {
            throw new ValidationCustomException(violations);
        }
        emissionFugitiveOngletRepository.save(emissionFugitiveOnglet); // Hibernate met à jour via cascade
    }


}
