// Characters ordered from darkest to lightest (usually)
// For standard white-on-black text, these map low brightness (0) to high brightness (255)
// Ideally: " " (space) is empty/black, "@" is full/white.

export const CharSetType = {
    Standard: 'Standard',
    Blocks: 'Blocks',
    Binary: 'Binary',
    Matrix: 'Matrix',
    Gibberish: 'Gibberish',
    Minimal: 'Minimal',
    Shapes: 'Shapes',
    Runes: 'Runes',
    Cursive: 'Cursive'
};

export const ColorMode = {
    Green: 'Green',
    Amber: 'Amber',
    Cyan: 'Cyan',
    White: 'White',
    Red: 'Red',
    Blue: 'Blue',
    Plasma: 'Plasma',
    Matrix: 'Matrix', // Multi-colored green gradient
    TrueColor: 'TrueColor' // Real webcam colors
};

export const CHAR_SETS = {
    [CharSetType.Standard]: " .:-=+*#%@MB",
    [CharSetType.Blocks]: " ░▒▓█",
    [CharSetType.Binary]: " 01",
    [CharSetType.Matrix]: " ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍｦｲｸｺ012345789Z:.\"*- ",
    [CharSetType.Gibberish]: " §±£¢¬µ¶°¹³²€Þßðøæåœ∑∆∫Ω√ƒ∂å≈≠≤≥÷◊",
    [CharSetType.Minimal]: " .*",
    [CharSetType.Shapes]: " ○◔◑◕●□▪■▲▼",
    [CharSetType.Runes]: " ᚠᚢᚦᚨᚱᚲᚺᚾᛁᛃᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ",
    [CharSetType.Cursive]: " ℓєℯ∂ωηℴℓ" // Simplified for gradient
};

export const DEFAULT_SETTINGS = {
    charSet: CharSetType.Standard,
    resolution: 120, // Width in characters
    contrast: 1.0,
    brightness: 0,
    inverted: false,
    colorMode: ColorMode.Green,
    fontSize: 10,
    glow: 0,
    flipX: true,
    gamma: 1.0,
    noise: 0,
    scanlineIntensity: 0.3
};
