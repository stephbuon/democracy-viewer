export const Range = ({
  value,
  setValue,
  label,
  min=0,
  max=100,
  step=1
}) => {
  return (
    <>
      <label for="range" class="form-label">
        {label}: {value}
      </label>
      <input
        type="range"
        class="form-range"
        id="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
    </>
  );
};
