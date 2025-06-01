import { useResults } from '~/contexts/ResultsContext';
import s from './results.module.scss';

export function Results() {
  const { results } = useResults();

  return (
    <div className={s.results}>
      <h2 className="font-display text-xl text-center">Results</h2>
      <div className={s.results_content}>
        {results.length > 0 ? (
          <ul className={s.results_list}>
            {results.map((result) => (
              <li key={result.id} className={s.result_item}>
                ({new Date(result.timestamp).toLocaleTimeString()}) {result.result}
              </li>
            ))}
          </ul>
        ) : (
          <p>No battles completed yet.</p>
        )}
      </div>
    </div>
  );
}