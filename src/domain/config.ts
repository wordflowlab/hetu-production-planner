export const config = {
  "fields": {
    "scene": "scenes",
    "requirement": "requirements",
    "usage": "usages",
    "task": "tasks",
    "block": "blocks",
    "note": "notes"
  },
  "defaults": {
    "currency": "CNY",
    "scenes": [],
    "requirements": [],
    "usages": [],
    "tasks": [],
    "blocks": [],
    "notes": []
  },
  "tabs": [
    "场次拆解",
    "制作需求",
    "准备计划",
    "改稿与意见",
    "专业交接"
  ]
} as const;
