const {
  AndroidConfig,
  withAndroidColors,
  withAndroidStyles,
} = require('expo/config-plugins');

// Keep in step with COLORS.primary in src/constants/Colors.ts. This file runs
// in Node during prebuild, so it can't import the app's TypeScript.
const ACCENT_COLOR = '#007AFF';
const COLOR_NAME = 'colorAccent';

// Native Android Alert buttons use the theme's colorAccent. The app never set
// one, so they fell back to a default green. app.json's `primaryColor` only
// sets colorPrimary, which is a different color.
module.exports = function withAndroidAccentColor(config) {
  const withColor = withAndroidColors(config, (colorsConfig) => {
    colorsConfig.modResults = AndroidConfig.Colors.assignColorValue(
      colorsConfig.modResults,
      { name: COLOR_NAME, value: ACCENT_COLOR },
    );
    return colorsConfig;
  });

  return withAndroidStyles(withColor, (stylesConfig) => {
    stylesConfig.modResults = AndroidConfig.Styles.assignStylesValue(
      stylesConfig.modResults,
      {
        add: true,
        parent: AndroidConfig.Styles.getAppThemeGroup(),
        name: COLOR_NAME,
        value: `@color/${COLOR_NAME}`,
      },
    );
    return stylesConfig;
  });
};
