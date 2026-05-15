# .gitignore.go — Go-specific ignore patterns
# Merge into your project's .gitignore or symlink this file.

# Compiled binaries and output
/bin/
/dist/
*.exe
*.exe~
*.dll
*.so
*.dylib

# Test output
*.test
*.out
coverage.out
coverage.html

# Go workspace file (local only, not committed)
go.work
go.work.sum

# Vendor directory (if using go mod vendor)
# Uncomment the next line if you do NOT vendor dependencies:
# vendor/

# Build cache (usually in $GOPATH/pkg but can appear locally)
/tmp/

# Air live-reload binary and config
.air.toml
/tmp/main

# dlv debug binaries
__debug_bin
