export const componentLevels=["foundation","primitive","composite","specialized","system"] as const;
export type ComponentLevel=typeof componentLevels[number];
export const componentFamilies=["layout","typography","controls","data-display","navigation","feedback","visualization","editors","interactive"] as const;
export type ComponentFamily=typeof componentFamilies[number];
export interface ComponentClassification{level:ComponentLevel;family:ComponentFamily}
