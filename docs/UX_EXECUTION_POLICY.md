# Owner Execution Policy

The repository owner is not expected to operate the project like a software engineer in order to validate experiments.

## Default owner interaction

When an owner-side check is genuinely useful, prefer this order:

1. normal browser interaction;
2. double-clickable Windows launcher with a graphical file picker;
3. one clearly named action with PASS/FAIL output;
4. terminal commands only when the owner explicitly wants them or no simpler interface is practical.

Do not require drag-and-drop onto scripts, shell arguments, manual environment-variable setup, Git operations or multi-command terminal recipes as the default owner workflow.

## Toolchain gates

Do not inherit exact runtime/package-manager pins from another project without evidence that exact versions affect this project's result.

Foundation/F0 uses only Node core file/binary APIs, so the supported baseline is Node `>=22.16.0`; npm version is not an F0 evidence variable.

Experiment-specific dependencies such as Spark, PlayCanvas or SplatTransform must still be pinned when their exact versions affect reproducibility.

## Evidence versus owner reproduction

Independent automated evidence may close a technical gate without forcing the owner to replay it locally. Owner-side reproduction is valuable as an additional evidence class, not a ceremonial prerequisite unless the gate explicitly depends on the owner's device or perception.

When a local owner check fails because tooling is missing, report that as an environment limitation. Do not instruct the owner to repair a development environment unless that is truly necessary for the project goal.
