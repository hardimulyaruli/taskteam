const demoUsers = [
  { id: 1, username: 'admin', name: 'Admin TaskTeam', role: 'admin', password: 'admin123' },
  { id: 2, username: 'manager', name: 'Manager TaskTeam', role: 'manager', password: 'manager123' },
  { id: 3, username: 'team', name: 'Team TaskTeam', role: 'team', password: 'team123' },
];

const demoTasks = [
  { id: 1, title: 'Setup repository', status: 'Selesai', assignee: 'team', deadline: '2026-05-10' },
  { id: 2, title: 'Integrasi API Login', status: 'Dikerjakan', assignee: 'team', deadline: '2026-05-12' },
  { id: 3, title: 'Review dashboard role admin', status: 'To Do', assignee: 'manager', deadline: '2026-05-13' },
  { id: 4, title: 'Dokumentasi endpoint', status: 'Dikerjakan', assignee: 'admin', deadline: '2026-05-14' },
  { id: 5, title: 'Uji alur login/logout', status: 'To Do', assignee: 'team', deadline: '2026-05-15' },
];

function buildActivities(tasks) {
  return tasks.slice(0, 8).map((task, index) => ({
    id: `${task.id}-${index}`,
    user: task.assignee,
    action: task.status === 'Selesai' ? 'menyelesaikan' : 'memperbarui',
    target: task.title,
    time: `-${index + 1} jam`,
  }));
}

module.exports = {
  demoUsers,
  demoTasks,
  buildActivities,
};
