---
name: Bug report
about: Report a bug to help improve the BigFloat library
title: '[BUG] '
labels: bug
assignees: ''
---

## Describe the bug
A clear and concise description of what the bug is.

## To Reproduce
Steps to reproduce the behavior:
```javascript
// Your code example here
const x = new BigFloat("1.23456789012345678901234567890");
const y = new BigFloat("2.0");
const result = BigFloat.add(x,y);
console.log(result.toString());
```

## Expected behavior
What you expected to happen.

**Expected output:**
```
3.23456789012345678901234567890
```

## Actual behavior
What actually happened.

**Actual output:**
```
3.23456789012345678901234567891
```

## Environment
- **JavaScript Engine:** [e.g., Node.js 18.0, Chrome 120, Firefox 115]
- **Library Version:** [e.g., 1.0.0]
- **Precision Setting:** [e.g., 100 digits, 1000 digits]
- **Operating System:** [e.g., Windows 11, macOS 14, Linux Ubuntu 22.04]

## Additional context
- Is this a precision issue, rounding issue, or algorithm issue?
- Does it occur at specific precision levels?
- Add any other context about the problem here
