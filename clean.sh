#!/bin/bash
# 删除所有 pyc 和 __pycache__
find . -type f -name "*.pyc" -delete
find . -type d -name "__pycache__" -delete

# 停止追踪已被 Git 记录的 pyc 文件
find . -type f -name "*.pyc" -exec git rm --cached {} \;
find . -type d -name "__pycache__" -exec git rm -r --cached {} \;

# 添加 .gitignore（如果存在）
[ -f .gitignore ] && git add .gitignore

# 提交清理结果
git commit -m "Clean up pyc and __pycache__ files"