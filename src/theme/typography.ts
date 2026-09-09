// Fraunces (títulos) + Source Serif 4 (cuerpo), cargadas como instancias
// estáticas en app/_layout.tsx vía expo-font (ver assets/fonts/). Los
// nombres de familia son las claves que se le pasan a useFonts — no
// dependen del nombre interno del archivo .ttf.
export const typography = {
  heading: "Fraunces-SemiBold",
  headingBold: "Fraunces-Bold",
  body: "SourceSerif4-Regular",
  bodyBold: "SourceSerif4-Bold",
} as const;

export const fontAssets = {
  "Fraunces-SemiBold": require("../../assets/fonts/Fraunces-SemiBold.ttf"),
  "Fraunces-Bold": require("../../assets/fonts/Fraunces-Bold.ttf"),
  "SourceSerif4-Regular": require("../../assets/fonts/SourceSerif4-Regular.ttf"),
  "SourceSerif4-Bold": require("../../assets/fonts/SourceSerif4-Bold.ttf"),
};
