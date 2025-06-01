import React, { useState, type FormEvent } from 'react';
import type { TAbility } from '~/types/ability.type';
import type { TTransformer } from '~/types/transformer.type';

interface TransformerFormProps {
  faction: 'Autobot' | 'Decepticon';
  onAddCombatant: (transformer: TTransformer) => void;
  abilities: TAbility[];
  onClose: () => void;
}

interface FormData {
  name: string;
  faction: 'Autobot' | 'Decepticon';
  icon: string;
  health: number;
  abilities: TAbility[];
}

export function TransformerForm({ faction, onAddCombatant, abilities, onClose }: TransformerFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    icon: '',
    faction: faction,
    health: 100,
    abilities: [],
  });
  const [error, setError] = useState<string>('');

  const handleAbilityToggle = (ability: TAbility): void => {
    setFormData((prev: FormData): FormData => { 
      const newAbilities: TAbility[] = prev.abilities.includes(ability)
        ? prev.abilities.filter((a: TAbility) => a !== ability)
        : [...prev.abilities, ability];
      
      if (newAbilities.length > 5) {
        setError('Maximum 5 abilities allowed');
        return prev;
      }
      if (newAbilities.length < 3 && newAbilities.length < prev.abilities.length) {
        setError('Minimum 3 abilities required');
        return prev;
      }
      setError('');
      return { ...prev, abilities: newAbilities };
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (formData.abilities.length < 3 || formData.abilities.length > 5) {
      setError('Please select 3 to 5 abilities');
      return;
    }
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    const newTransformer: TTransformer = {
      id: crypto.randomUUID(),
      name: formData.name,
      faction: faction,
      icon: formData.icon || `/app/assets/default-${faction.toLowerCase()}.png`,
      health: parseInt(formData.health.toString()),
      wins: 0,
      losses: 0,
      abilities: formData.abilities,
    };
    onAddCombatant(newTransformer);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-stone-500 mb-1">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
            setFormData({ ...formData, name: e.target.value })}
          className="w-full p-2 rounded bg-gray-700 text-white"
          required
        />
      </div>
      <div>
        <label className="block text-stone-500 mb-1">Icon URL (Optional)</label>
        <input
          type="text"
          value={formData.icon}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
            setFormData({ ...formData, icon: e.target.value })}
          className="w-full p-2 rounded bg-gray-700 text-stone-500"
        />
      </div>
      <div>
        <label className="block text-stone-500  mb-1">Health</label>
        <input
          type="number"
          value={formData.health}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
            setFormData({ ...formData, health: parseInt(e.target.value) || 0 })}
          min="100"
          step="10"
          className="w-full p-2 rounded bg-gray-700 text-stone-500"
          required
        />
      </div>
      <div>
        <label className="block text-stone-500 mb-1">Abilities (Select 3-5)</label>
        <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto border-1 rounded px-4 py-2
          border-stone-700 even:bg-grey-50">
          {abilities.map((ability: TAbility) => (
            <label key={ability.id} className="flex items-start text-stone-300">
              <input
                type="checkbox"
                checked={formData.abilities.includes(ability)}
                onChange={() => handleAbilityToggle(ability)}
                className="mt-2 mr-2"
              />
              <div>
                <span className="font-semibold text-gray-400">{ability.name}</span>
                <p className="text-sm text-gray-500">{ability.description} (Damage: {ability.damage}, Cooldown: {ability.cooldown}s)</p>
              </div>
            </label>
          ))}
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
      <div className="flex justify-end space-x-2">
        <button
          type="submit"
          className="px-4 py-2 bg-red-700 text-stone-50 rounded hover:bg-red-900"
        >
          Add Combatant
        </button>
      </div>
    </form>
  );
};
