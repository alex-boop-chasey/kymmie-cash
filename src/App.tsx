import SlotMachine from './components/SlotMachine';
import Effects from './components/Effects';

export default function App() {
  return (
    <div className="stage">
      <div className="stage-glow" aria-hidden />
      <SlotMachine />
      <Effects />
    </div>
  );
}
