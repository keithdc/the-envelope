import Envelope from "../components/Envelope.jsx"

/**
 * "flap" open animation: the full-bleed envelope whose triangular flap folds
 * open and the letter rises out. Adapts the template contract
 * ({ data, assets, onOpened }) to the Envelope component's `event` prop.
 */
export default function FlapOpen({ data, assets, onOpened }) {
  const event = { ...data, ...assets }
  return <Envelope event={event} onOpened={onOpened} />
}
