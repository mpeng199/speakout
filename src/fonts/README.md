# Fonts

Both faces are self-hosted (served from this site, not from a font service) and
load with `font-display: swap`.

| File | Made from | Changes |
| --- | --- | --- |
| `SpeakoutSans-Var.woff2` | Mona Sans (GitHub) | Width fixed at 112.5 (semi-expanded), weight range cut to 500–650, Latin subset |
| `SpeakoutSerif-Regular.woff2` | Source Serif 4 (Adobe) | Static Regular 400, Latin subset |

Both originals are licensed under the SIL Open Font License 1.1 and carry
Reserved Font Names ("Mona" and "Source"). Because these files are modified
versions, they are renamed "Speakout Sans" and "Speakout Serif". The original
copyright notices are kept inside the files, and the licenses are in
`OFL-MonaSans.txt` and `OFL-SourceSerif4.txt`.

Trimming the files took the fonts from about 149 KB to 55 KB, which helps the
first paint on slow mobile connections.
