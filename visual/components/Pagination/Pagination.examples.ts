// Positional args: Pagination(page, totalPages, variant, siblingCount, boundaryCount, disabled). `page` should be a bare number $variable.
export const paginationExamples = [
  {
    title: "Basic pagination",
    code: '$page = 1\nroot = Stack([pager, status], "sm")\npager = Pagination($page, 10)\nstatus = Text("Page " + $page + " of 10", "muted", "caption")',
  },
  {
    title: "Pagination with many pages",
    code: '$page = 20\nroot = Stack([pager, status], "sm")\npager = Pagination($page, 99, "default", 2, 1)\nstatus = Text("Showing page " + $page + " of 99", "muted", "caption")',
  },
  {
    title: "Compact pagination",
    code: '$page = 3\nroot = Stack([pager, status], "sm")\npager = Pagination($page, 8, "compact")\nstatus = Text("Current page: " + $page, "muted", "caption")',
  },
  {
    title: "Paging a table",
    code: '$page = 1\nroot = Stack([table, pager], "md")\ntable = Table([{key: "name", header: "Name"}, {key: "role", header: "Role"}], @Filter(people, "page", "==", $page), "People (illustrative), 2 per page")\npager = Pagination($page, 3, "compact")\npeople = [{page: 1, name: "Alex", role: "Design"}, {page: 1, name: "Sam", role: "Support"}, {page: 2, name: "Priya", role: "Engineering"}, {page: 2, name: "Jordan", role: "Finance"}, {page: 3, name: "Chen", role: "Legal"}, {page: 3, name: "Maria", role: "Sales"}]',
  },
  {
    title: "Disabled pagination",
    code: 'root = Pagination(4, 12, "default", 1, 1, true)',
  },
] as const;
