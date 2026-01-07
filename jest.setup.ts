import "@testing-library/react-native/build/matchers/extend-expect";

// Mock @expo/vector-icons to prevent async font loading warnings in tests
jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    Ionicons: ({ name, ...props }: { name: string }) =>
      React.createElement(Text, props, name),
  };
});
