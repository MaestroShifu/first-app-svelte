// NOTE: jest-dom adds handy assertions to Jest and it is recommended, but not required.
import '@testing-library/jest-dom';

import { render, fireEvent, screen } from '@testing-library/svelte';

import AppTwo from '../AppTwo.svelte';

test('shows proper heading when rendered', () => {
  render(AppTwo, { name: 'World' });

  expect(screen.getByText('Hello World!')).toBeInTheDocument();
});

// Note: This is as an async test as we are using `fireEvent`
test('changes button text on click', async () => {
  render(AppTwo, { name: 'World' });
  const button = screen.getByText('Button');

  // Using await when firing events is unique to the svelte testing library because
  // we have to wait for the next `tick` so that Svelte flushes all pending state changes.
  await fireEvent.click(button);

  expect(button).toHaveTextContent('Button Clicked');
});
