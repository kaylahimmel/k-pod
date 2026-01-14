import "@testing-library/react-native/build/matchers/extend-expect";
import "react-native-gesture-handler/jestSetup";

// Mock utils module for presenter tests
jest.mock("./src/utils", () => ({
  truncateText: (text: string, maxLength: number): string => {
    if (!text || text.length <= maxLength) {
      return text || "";
    }
    return text.slice(0, maxLength - 1).trim() + "…";
  },
  stripHtml: (html: string): string => {
    if (!html) return "";
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, " ")
      .trim();
  },
}));

// Mock @expo/vector-icons to prevent async font loading warnings in tests
jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    Ionicons: ({ name, ...props }: { name: string }) =>
      React.createElement(Text, props, name),
  };
});

// Mock react-native-reanimated
jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock react-native-draggable-flatlist
jest.mock("react-native-draggable-flatlist", () => {
  const React = require("react");
  const { FlatList, View } = require("react-native");

  const ScaleDecorator = ({ children }: { children: React.ReactNode }) =>
    React.createElement(View, null, children);

  const DraggableFlatList = ({
    data,
    renderItem,
    keyExtractor,
    ...props
  }: any) =>
    React.createElement(FlatList, {
      data,
      renderItem: ({ item, index }: any) =>
        renderItem({ item, index, drag: jest.fn(), isActive: false }),
      keyExtractor,
      ...props,
    });

  return {
    __esModule: true,
    default: DraggableFlatList,
    ScaleDecorator,
  };
});
