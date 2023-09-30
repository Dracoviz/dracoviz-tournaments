function getValidLabel(showValid, valid) {
  if (!showValid) {
    return null;
  }
  return (
    <span>
      {valid === true ? '✅' : '❌'}
    </span>
  );
}

export default getValidLabel;
