#!/bin/bash

echo "🧪 Running Autheo Test Suite"
echo "=============================="

# Run vitest with coverage
npx vitest run --reporter=verbose --coverage

# Check exit code
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ All tests passed successfully!"
    echo ""
    echo "📊 Test Coverage Report:"
    echo "Open coverage/index.html to view detailed coverage report"
else
    echo ""
    echo "❌ Some tests failed"
    exit 1
fi