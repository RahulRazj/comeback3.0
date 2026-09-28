// Script to generate complete, high-quality seed dataset for 90-Day Interview Command Center
const fs = require('fs');
const path = require('path');

const dsaPhase1 = [
  // Arrays
  { num: 1, title: 'Two Sum', diff: 'Easy', cat: 'Phase 1: Arrays', prio: 1, intuition: 'Use Dictionary<value, index> for O(1) complement lookup.', pitfalls: 'Using same index twice; sorting when original indices needed.', tc: 'O(N)', sc: 'O(N)', conf: 5, status: 'mastered' },
  { num: 26, title: 'Remove Duplicates from Sorted Array', diff: 'Easy', cat: 'Phase 1: Arrays', prio: 1, intuition: 'Two pointers: slow pointer marks write index for unique elements.', pitfalls: 'Allocating a new array; not handling empty array.', tc: 'O(N)', sc: 'O(1)', conf: 5, status: 'mastered' },
  { num: 27, title: 'Remove Element', diff: 'Easy', cat: 'Phase 1: Arrays', prio: 2, intuition: 'Two pointers: overwrite matching target values in-place.', pitfalls: 'Off-by-one errors with length return.', tc: 'O(N)', sc: 'O(1)', conf: 4, status: 'completed' },
  { num: 88, title: 'Merge Sorted Array', diff: 'Easy', cat: 'Phase 1: Arrays', prio: 1, intuition: 'Merge from back to front to avoid overwriting elements in nums1.', pitfalls: 'Merging from front requires shifting elements or extra array.', tc: 'O(M+N)', sc: 'O(1)', conf: 5, status: 'mastered' },
  { num: 121, title: 'Best Time to Buy and Sell Stock', diff: 'Easy', cat: 'Phase 1: Arrays', prio: 1, intuition: 'Track running minimum price and max profit in single pass.', pitfalls: 'Selling before buying; quadratic O(N^2) double loop.', tc: 'O(N)', sc: 'O(1)', conf: 5, status: 'mastered' },
  { num: 169, title: 'Majority Element', diff: 'Easy', cat: 'Phase 1: Arrays', prio: 1, intuition: 'Boyer-Moore Voting Algorithm: maintain count and candidate.', pitfalls: 'Hash map uses O(N) space; Boyer-Moore achieves O(1) space.', tc: 'O(N)', sc: 'O(1)', conf: 5, status: 'mastered' },
  { num: 238, title: 'Product of Array Except Self', diff: 'Medium', cat: 'Phase 1: Arrays', prio: 1, intuition: 'Prefix and Suffix products: calculate left prefix in output, right suffix on return.', pitfalls: 'Using division operator (forbidden by problem description).', tc: 'O(N)', sc: 'O(1)', conf: 4, status: 'completed' },
  { num: 283, title: 'Move Zeroes', diff: 'Easy', cat: 'Phase 1: Arrays', prio: 2, intuition: 'Two pointers: swap non-zero elements to front index.', pitfalls: 'Creating temporary array instead of in-place mutation.', tc: 'O(N)', sc: 'O(1)', conf: 5, status: 'mastered' },

  // Two Pointers
  { num: 11, title: 'Container With Most Water', diff: 'Medium', cat: 'Phase 1: Two Pointers', prio: 1, intuition: 'Converging pointers from both ends; always advance shorter boundary inward.', pitfalls: 'Advancing taller line cannot increase area constrained by short side.', tc: 'O(N)', sc: 'O(1)', conf: 4, status: 'completed' },
  { num: 15, title: '3Sum', diff: 'Medium', cat: 'Phase 1: Two Pointers', prio: 1, intuition: 'Sort array first; fix index i, then Two Pointers on remaining sum. Skip duplicates.', pitfalls: 'Duplicate triplets in result set; not breaking when nums[i] > 0.', tc: 'O(N^2)', sc: 'O(1)', conf: 4, status: 'completed' },
  { num: 125, title: 'Valid Palindrome', diff: 'Easy', cat: 'Phase 1: Two Pointers', prio: 1, intuition: 'Two converging pointers, skip non-alphanumeric chars, compare case-insensitively.', pitfalls: 'Allocating heavy regex strings in heap.', tc: 'O(N)', sc: 'O(1)', conf: 5, status: 'mastered' },
  { num: 167, title: 'Two Sum II - Input Array Is Sorted', diff: 'Medium', cat: 'Phase 1: Two Pointers', prio: 1, intuition: 'Since array is sorted, sum < target -> left++, sum > target -> right--.', pitfalls: 'Using hash map when sorted property enables O(1) two pointers.', tc: 'O(N)', sc: 'O(1)', conf: 5, status: 'mastered' },

  // Sliding Window
  { num: 3, title: 'Longest Substring Without Repeating Characters', diff: 'Medium', cat: 'Phase 1: Sliding Window', prio: 1, intuition: 'Sliding window with last-seen character index map. Jump left pointer past duplicate.', pitfalls: 'Forgetting to check if duplicate index is >= current left pointer.', tc: 'O(N)', sc: 'O(min(N,M))', conf: 4, status: 'completed' },
  { num: 209, title: 'Minimum Size Subarray Sum', diff: 'Medium', cat: 'Phase 1: Sliding Window', prio: 2, intuition: 'Expand right to reach target sum, then shrink left to find minimal valid length.', pitfalls: 'Resetting left pointer to 0 instead of sliding window.', tc: 'O(N)', sc: 'O(1)', conf: 4, status: 'completed' },
  { num: 424, title: 'Longest Repeating Character Replacement', diff: 'Medium', cat: 'Phase 1: Sliding Window', prio: 1, intuition: 'Window condition: (windowLength - maxFreq) <= k. Shrink left if violated.', pitfalls: 'Recalculating maxFreq on shrink (lazy invariant is fine).', tc: 'O(N)', sc: 'O(1)', conf: 3, status: 'in_progress' },
  { num: 567, title: 'Permutation in String', diff: 'Medium', cat: 'Phase 1: Sliding Window', prio: 2, intuition: 'Fixed sliding window of size s1.Length with character frequency match counter.', pitfalls: 'Sorting substring at each window step (O(N*K log K) vs O(N) array match).', tc: 'O(N)', sc: 'O(1)', conf: 4, status: 'completed' },
  { num: 643, title: 'Maximum Average Subarray I', diff: 'Easy', cat: 'Phase 1: Sliding Window', prio: 3, intuition: 'Fixed size k window: add nums[i], subtract nums[i-k]. Track max sum.', pitfalls: 'Integer division truncation when calculating average.', tc: 'O(N)', sc: 'O(1)', conf: 5, status: 'mastered' },
  { num: 1004, title: 'Max Consecutive Ones III', diff: 'Medium', cat: 'Phase 1: Sliding Window', prio: 2, intuition: 'At most k zeros in window: expand right, count zeros; shrink left when zeros > k.', pitfalls: 'Shrinking by more than 1 per step.', tc: 'O(N)', sc: 'O(1)', conf: 4, status: 'completed' },

  // Prefix Sum
  { num: 1480, title: 'Running Sum of 1d Array', diff: 'Easy', cat: 'Phase 1: Prefix Sum', prio: 2, intuition: 'Cumulative sum array: nums[i] += nums[i-1].', pitfalls: 'Off-by-one at index 0.', tc: 'O(N)', sc: 'O(1)', conf: 5, status: 'mastered' },
  { num: 560, title: 'Subarray Sum Equals K', diff: 'Medium', cat: 'Phase 1: Prefix Sum', prio: 1, intuition: 'Prefix sum + Hash Map of prefix frequencies! If (currSum - k) in map, add count.', pitfalls: 'Sliding window fails with negative numbers; hash map of prefix sums is mandatory.', tc: 'O(N)', sc: 'O(N)', conf: 4, status: 'completed' },
  { num: 724, title: 'Find Pivot Index', diff: 'Easy', cat: 'Phase 1: Prefix Sum', prio: 2, intuition: 'Calculate total sum. Left sum == total sum - left sum - nums[i].', pitfalls: 'Returning last pivot instead of leftmost.', tc: 'O(N)', sc: 'O(1)', conf: 5, status: 'mastered' },

  // Binary Search
  { num: 35, title: 'Search Insert Position', diff: 'Easy', cat: 'Phase 1: Binary Search', prio: 2, intuition: 'Binary search lower bound: when loop ends (l > r), l is the correct insert position.', pitfalls: 'Returning r or -1 instead of l.', tc: 'O(log N)', sc: 'O(1)', conf: 5, status: 'mastered' },
  { num: 69, title: 'Sqrt(x)', diff: 'Easy', cat: 'Phase 1: Binary Search', prio: 3, intuition: 'Binary search in [1, x]. Check if mid * mid <= x (use long to avoid overflow).', pitfalls: 'Integer overflow on mid * mid without 64-bit cast.', tc: 'O(log N)', sc: 'O(1)', conf: 5, status: 'mastered' },
  { num: 278, title: 'First Bad Version', diff: 'Easy', cat: 'Phase 1: Binary Search', prio: 3, intuition: 'Binary search first true: if isBadVersion(mid), r = mid; else l = mid + 1.', pitfalls: 'Integer overflow on (l + r) / 2; use l + (r - l) / 2.', tc: 'O(log N)', sc: 'O(1)', conf: 5, status: 'mastered' },
  { num: 704, title: 'Binary Search', diff: 'Easy', cat: 'Phase 1: Binary Search', prio: 1, intuition: 'Canonical while(l <= r) binary search on sorted array.', pitfalls: 'l <= r vs l < r conditions.', tc: 'O(log N)', sc: 'O(1)', conf: 5, status: 'mastered' },
  { num: 875, title: 'Koko Eating Bananas', diff: 'Medium', cat: 'Phase 1: Binary Search', prio: 1, intuition: 'Binary search on answer space [1, max(piles)] with hours predicate.', pitfalls: 'Ceiling division: (pile + k - 1) / k.', tc: 'O(N log(max))', sc: 'O(1)', conf: 4, status: 'completed' },
  { num: 1011, title: 'Capacity To Ship Packages Within D Days', diff: 'Medium', cat: 'Phase 1: Binary Search', prio: 2, intuition: 'Binary search on ship capacity [max(weights), sum(weights)].', pitfalls: 'Lower bound cannot be less than max single item weight.', tc: 'O(N log(sum))', sc: 'O(1)', conf: 4, status: 'completed' },

  // Hash Map
  { num: 49, title: 'Group Anagrams', diff: 'Medium', cat: 'Phase 1: Hash Map', prio: 1, intuition: 'Canonical key: sorted string or character frequency string.', pitfalls: 'Concatenation collisions.', tc: 'O(N*K)', sc: 'O(N*K)', conf: 4, status: 'completed' },
  { num: 128, title: 'Longest Consecutive Sequence', diff: 'Medium', cat: 'Phase 1: Hash Map', prio: 1, intuition: 'HashSet for O(1) lookup. Only start sequence check if (num - 1) is NOT in set.', pitfalls: 'Checking sequences starting from middle elements degrades to O(N^2).', tc: 'O(N)', sc: 'O(N)', conf: 4, status: 'completed' },
  { num: 217, title: 'Contains Duplicate', diff: 'Easy', cat: 'Phase 1: Hash Map', prio: 2, intuition: 'HashSet.Add() returns false if already present.', pitfalls: 'Sorting in O(N log N) when HashSet is O(N).', tc: 'O(N)', sc: 'O(N)', conf: 5, status: 'mastered' },
  { num: 242, title: 'Valid Anagram', diff: 'Easy', cat: 'Phase 1: Hash Map', prio: 1, intuition: 'Fixed array count[26] for frequencies.', pitfalls: 'Strings of different lengths.', tc: 'O(N)', sc: 'O(1)', conf: 5, status: 'mastered' },
  { num: 347, title: 'Top K Frequent Elements', diff: 'Medium', cat: 'Phase 1: Hash Map', prio: 1, intuition: 'Bucket sort by frequency in O(N) linear time.', pitfalls: 'Full O(N log N) sort instead of bucket sort or MinHeap.', tc: 'O(N)', sc: 'O(N)', conf: 4, status: 'completed' },

  // Stack & Queue
  { num: 20, title: 'Valid Parentheses', diff: 'Easy', cat: 'Phase 1: Stack', prio: 1, intuition: 'LIFO stack: push expected closing bracket; check top equals char.', pitfalls: 'Empty stack pop; unmatched opening brackets remaining.', tc: 'O(N)', sc: 'O(N)', conf: 5, status: 'mastered' },
  { num: 155, title: 'Min Stack', diff: 'Medium', cat: 'Phase 1: Stack', prio: 1, intuition: 'Parallel minStack or store pair (val, currentMin) on single stack.', pitfalls: 'Losing minimum history when popping.', tc: 'O(1)', sc: 'O(N)', conf: 5, status: 'mastered' },
  { num: 394, title: 'Decode String', diff: 'Medium', cat: 'Phase 1: Stack', prio: 2, intuition: 'Two stacks: countStack and stringStack for nested brackets.', pitfalls: 'Multi-digit counts (e.g. 100[a]); nested brackets [2[b]].', tc: 'O(Output)', sc: 'O(Output)', conf: 3, status: 'in_progress' },
  { num: 739, title: 'Daily Temperatures', diff: 'Medium', cat: 'Phase 1: Stack', prio: 1, intuition: 'Monotonic decreasing stack storing indices. Pop colder days when warmer arrives.', pitfalls: 'Storing temperatures directly instead of indices on stack.', tc: 'O(N)', sc: 'O(N)', conf: 4, status: 'completed' },
  { num: 225, title: 'Implement Stack using Queues', diff: 'Easy', cat: 'Phase 1: Queue', prio: 3, intuition: 'Rotate queue on push: enqueue x, then rotate previous size elements behind it.', pitfalls: 'O(N) push vs O(N) pop trade-offs.', tc: 'O(N) push, O(1) pop', sc: 'O(N)', conf: 4, status: 'completed' },
  { num: 232, title: 'Implement Queue using Stacks', diff: 'Easy', cat: 'Phase 1: Queue', prio: 2, intuition: 'Two stacks: inStack for push, outStack for pop/peek (lazy transfer).', pitfalls: 'Transferring between stacks on every push instead of amortized pop.', tc: 'O(1) amortized', sc: 'O(N)', conf: 5, status: 'mastered' },
  { num: 933, title: 'Number of Recent Calls', diff: 'Easy', cat: 'Phase 1: Queue', prio: 3, intuition: 'Queue of timestamps: enqueue ping, dequeue elements older than t - 3000.', pitfalls: 'Unbounded memory if not dequeuing old requests.', tc: 'O(1) amortized', sc: 'O(3000)', conf: 5, status: 'mastered' },
];

const dsaPhase2 = [
  // Linked List
  { num: 21, title: 'Merge Two Sorted Lists', diff: 'Easy', cat: 'Phase 2: Linked List', prio: 1, intuition: 'Dummy head node. Compare list1 and list2 heads, advance smaller pointer.', pitfalls: 'Null pointer exceptions on exhaustion.', tc: 'O(N+M)', sc: 'O(1)', conf: 5, status: 'mastered' },
  { num: 141, title: 'Linked List Cycle', diff: 'Easy', cat: 'Phase 2: Linked List', prio: 1, intuition: 'Floyd\'s Tortoise and Hare: slow pointer (1 step), fast pointer (2 steps).', pitfalls: 'fast == null or fast.next == null boundary check.', tc: 'O(N)', sc: 'O(1)', conf: 5, status: 'mastered' },
  { num: 142, title: 'Linked List Cycle II', diff: 'Medium', cat: 'Phase 2: Linked List', prio: 2, intuition: 'When slow and fast meet, reset slow to head. Advance both 1 step; meeting point is cycle start.', pitfalls: 'Mathematical distance proof: 2(F+a) = F+nC+a => F = nC-a.', tc: 'O(N)', sc: 'O(1)', conf: 4, status: 'completed' },
  { num: 160, title: 'Intersection of Two Linked Lists', diff: 'Easy', cat: 'Phase 2: Linked List', prio: 2, intuition: 'Two pointers: pointer A jumps to head B at end; pointer B jumps to head A. Meet at intersection.', pitfalls: 'Modifying list nodes.', tc: 'O(N+M)', sc: 'O(1)', conf: 5, status: 'mastered' },
  { num: 206, title: 'Reverse Linked List', diff: 'Easy', cat: 'Phase 2: Linked List', prio: 1, intuition: 'Three pointers: prev, curr, nextTemp. Redirect curr.next = prev in single pass.', pitfalls: 'Losing rest of list before redirecting pointer.', tc: 'O(N)', sc: 'O(1)', conf: 5, status: 'mastered' },
  { num: 234, title: 'Palindrome Linked List', diff: 'Easy', cat: 'Phase 2: Linked List', prio: 2, intuition: 'Find middle (fast/slow), reverse second half, compare halves.', pitfalls: 'Odd vs even list lengths.', tc: 'O(N)', sc: 'O(1)', conf: 4, status: 'completed' },

  // Trees
  { num: 94, title: 'Binary Tree Inorder Traversal', diff: 'Easy', cat: 'Phase 2: Trees', prio: 1, intuition: 'Left -> Root -> Right. Use stack for iterative traversal or recursion.', pitfalls: 'Order confusion with preorder / postorder.', tc: 'O(N)', sc: 'O(H)', conf: 5, status: 'mastered' },
  { num: 98, title: 'Validate Binary Search Tree', diff: 'Medium', cat: 'Phase 2: Trees', prio: 1, intuition: 'Every node must satisfy min < val < max. Pass narrowing ranges down DFS.', pitfalls: 'Only checking immediate left and right children instead of whole subtree.', tc: 'O(N)', sc: 'O(H)', conf: 4, status: 'completed' },
  { num: 100, title: 'Same Tree', diff: 'Easy', cat: 'Phase 2: Trees', prio: 2, intuition: 'Recursive DFS: both null -> true; one null or values differ -> false; recurse left & right.', pitfalls: 'Null pointer dereference on asymmetric trees.', tc: 'O(N)', sc: 'O(H)', conf: 5, status: 'mastered' },
  { num: 102, title: 'Binary Tree Level Order Traversal', diff: 'Medium', cat: 'Phase 2: Trees', prio: 1, intuition: 'Queue BFS. Snap levelSize = queue.Count to process each horizontal level in batch.', pitfalls: 'Using dynamic queue.Count in loop condition.', tc: 'O(N)', sc: 'O(N)', conf: 5, status: 'mastered' },
  { num: 104, title: 'Maximum Depth of Binary Tree', diff: 'Easy', cat: 'Phase 2: Trees', prio: 1, intuition: '1 + Math.Max(MaxDepth(left), MaxDepth(right)). Base case null -> 0.', pitfalls: 'Stack overflow on degenerate linked-list tree.', tc: 'O(N)', sc: 'O(H)', conf: 5, status: 'mastered' },
  { num: 110, title: 'Balanced Binary Tree', diff: 'Easy', cat: 'Phase 2: Trees', prio: 2, intuition: 'Bottom-up DFS: return -1 immediately if subtree unbalanced, avoiding O(N^2) recalculations.', pitfalls: 'Top-down approach calculating height at every node is O(N^2).', tc: 'O(N)', sc: 'O(H)', conf: 4, status: 'completed' },
  { num: 226, title: 'Invert Binary Tree', diff: 'Easy', cat: 'Phase 2: Trees', prio: 1, intuition: 'Swap left and right children recursively.', pitfalls: 'Overwriting child before recursion.', tc: 'O(N)', sc: 'O(H)', conf: 5, status: 'mastered' },
  { num: 235, title: 'Lowest Common Ancestor of a BST', diff: 'Medium', cat: 'Phase 2: Trees', prio: 1, intuition: 'BST property: if both p & q < root, go left; if both > root, go right; split is LCA!', pitfalls: 'Treating as generic binary tree when BST property gives O(H) descent.', tc: 'O(H)', sc: 'O(1)', conf: 5, status: 'mastered' },
  { num: 236, title: 'Lowest Common Ancestor of a Binary Tree', diff: 'Medium', cat: 'Phase 2: Trees', prio: 1, intuition: 'DFS: if root == p or root == q, return root. If both left and right return non-null, root is LCA.', pitfalls: 'Assuming BST ordering on non-BST tree.', tc: 'O(N)', sc: 'O(H)', conf: 4, status: 'completed' },
  { num: 543, title: 'Diameter of Binary Tree', diff: 'Easy', cat: 'Phase 2: Trees', prio: 1, intuition: 'Diameter at node = leftHeight + rightHeight. Track global max during DFS.', pitfalls: 'Assuming diameter must pass through root.', tc: 'O(N)', sc: 'O(H)', conf: 4, status: 'completed' },

  // Heaps
  { num: 215, title: 'Kth Largest Element in an Array', diff: 'Medium', cat: 'Phase 2: Heaps', prio: 1, intuition: 'Min-Heap of size k (root holds kth largest) or QuickSelect O(N) partition.', pitfalls: 'Using Max-Heap storing all N items O(N log N) instead of size K.', tc: 'O(N log K)', sc: 'O(K)', conf: 4, status: 'completed' },
  { num: 295, title: 'Find Median from Data Stream', diff: 'Hard', cat: 'Phase 2: Heaps', prio: 1, intuition: 'Two heaps: MaxHeap for lower half, MinHeap for upper half. Balance sizes within 1.', pitfalls: 'Heaps getting out of balance or lower half max > upper half min.', tc: 'O(log N) add, O(1) find', sc: 'O(N)', conf: 3, status: 'in_progress' },
  { num: 703, title: 'Kth Largest Element in a Stream', diff: 'Easy', cat: 'Phase 2: Heaps', prio: 2, intuition: 'Min-Heap of capacity k. When element > peek, replace and heapify.', pitfalls: 'Heap size growing beyond k.', tc: 'O(log K)', sc: 'O(K)', conf: 4, status: 'completed' },

  // Intervals & Matrix
  { num: 56, title: 'Merge Intervals', diff: 'Medium', cat: 'Phase 2: Intervals', prio: 1, intuition: 'Sort intervals by start time. If current.start <= prev.end, merge (prev.end = max(prev.end, curr.end)).', pitfalls: 'Not sorting intervals first.', tc: 'O(N log N)', sc: 'O(N)', conf: 4, status: 'completed' },
  { num: 57, title: 'Insert Interval', diff: 'Medium', cat: 'Phase 2: Intervals', prio: 2, intuition: 'Add all intervals before newInterval, merge overlapping intervals, append remaining.', pitfalls: 'Adding newInterval without merging multi-interval spans.', tc: 'O(N)', sc: 'O(N)', conf: 4, status: 'completed' },
  { num: 252, title: 'Meeting Rooms', diff: 'Easy', cat: 'Phase 2: Intervals', prio: 2, intuition: 'Sort by start time; check if intervals[i].start < intervals[i-1].end.', pitfalls: 'Intervals not sorted.', tc: 'O(N log N)', sc: 'O(1)', conf: 5, status: 'mastered' },
  { num: 253, title: 'Meeting Rooms II', diff: 'Medium', cat: 'Phase 2: Intervals', prio: 1, intuition: 'Min-Heap of end times, or two sorted arrays (starts & ends) with two pointers.', pitfalls: 'Reusing a room when start < end.', tc: 'O(N log N)', sc: 'O(N)', conf: 4, status: 'completed' },
  { num: 54, title: 'Spiral Matrix', diff: 'Medium', cat: 'Phase 2: Matrix', prio: 2, intuition: 'Maintain 4 boundary pointers (top, bottom, left, right). Walk perimeter and shrink boundaries.', pitfalls: 'Single row or column matrices causing duplicate traversals.', tc: 'O(M*N)', sc: 'O(1)', conf: 4, status: 'completed' },
  { num: 73, title: 'Set Matrix Zeroes', diff: 'Medium', cat: 'Phase 2: Matrix', prio: 2, intuition: 'Use first row and column as markers to achieve O(1) extra space.', pitfalls: 'Overwriting marker cells before reading the matrix interior.', tc: 'O(M*N)', sc: 'O(1)', conf: 4, status: 'completed' },
  { num: 74, title: 'Search a 2D Matrix', diff: 'Medium', cat: 'Phase 2: Matrix', prio: 1, intuition: 'Treat m x n matrix as 1D sorted array of size m*n. Binary search with row = mid/n, col = mid%n.', pitfalls: 'Doing 2 binary searches when single flat index binary search is O(log(M*N)).', tc: 'O(log(M*N))', sc: 'O(1)', conf: 5, status: 'mastered' },
  { num: 79, title: 'Word Search', diff: 'Medium', cat: 'Phase 2: Matrix', prio: 1, intuition: 'Backtracking DFS. Mark visited in-place with dummy char \'#\', restore on backtrack.', pitfalls: 'Revisiting the same cell within one word path.', tc: 'O(M*N * 3^L)', sc: 'O(L)', conf: 3, status: 'in_progress' },
  { num: 200, title: 'Number of Islands', diff: 'Medium', cat: 'Phase 2: Matrix', prio: 1, intuition: 'Connected components via DFS: sink visited land (\'1\' -> \'0\') recursively.', pitfalls: 'Boundary checks r < 0 || r >= R || c < 0 || c >= C.', tc: 'O(M*N)', sc: 'O(M*N)', conf: 5, status: 'mastered' },
];

const dsaPhase3 = [
  // Graphs & BFS/DFS & Topo Sort
  { num: 133, title: 'Clone Graph', diff: 'Medium', cat: 'Phase 3: Graphs & BFS/DFS', prio: 1, intuition: 'DFS/BFS with visited Dictionary<Node, Node> to handle graph cycles.', pitfalls: 'Infinite recursion on cyclic graphs without visited map.', tc: 'O(V+E)', sc: 'O(V)', conf: 4, status: 'completed' },
  { num: 207, title: 'Course Schedule', diff: 'Medium', cat: 'Phase 3: Topological Sort', prio: 1, intuition: 'Cycle detection via Kahn\'s BFS (in-degree array) or 3-state DFS. If cycle exists, cannot finish.', pitfalls: 'Treating graph as undirected.', tc: 'O(V+E)', sc: 'O(V+E)', conf: 4, status: 'completed' },
  { num: 210, title: 'Course Schedule II', diff: 'Medium', cat: 'Phase 3: Topological Sort', prio: 1, intuition: 'Kahn\'s algorithm: enqueue nodes with inDegree == 0. Append to order list as dequeued.', pitfalls: 'Returning order when cycle prevents full traversal (return empty array).', tc: 'O(V+E)', sc: 'O(V+E)', conf: 4, status: 'completed' },
  { num: 417, title: 'Pacific Atlantic Water Flow', diff: 'Medium', cat: 'Phase 3: Graphs & BFS/DFS', prio: 2, intuition: 'Reverse DFS from ocean borders uphill. Intersect reachable sets.', pitfalls: 'Simulating water flowing down from every cell is O((M*N)^2).', tc: 'O(M*N)', sc: 'O(M*N)', conf: 3, status: 'in_progress' },
  { num: 547, title: 'Number of Provinces', diff: 'Medium', cat: 'Phase 3: Graphs & BFS/DFS', prio: 2, intuition: 'Connected components in undirected graph: Union-Find (Disjoint Set) or DFS.', pitfalls: 'Misreading adjacency matrix dimensions.', tc: 'O(N^2)', sc: 'O(N)', conf: 4, status: 'completed' },
  { num: 994, title: 'Rotting Oranges', diff: 'Medium', cat: 'Phase 3: Graphs & BFS/DFS', prio: 1, intuition: 'Multi-source BFS from all initially rotten oranges. Track minutes elapsed per level.', pitfalls: 'Using DFS (shortest time requires multi-source BFS).', tc: 'O(M*N)', sc: 'O(M*N)', conf: 4, status: 'completed' },
  { num: 695, title: 'Max Area of Island', diff: 'Medium', cat: 'Phase 3: Graphs & BFS/DFS', prio: 2, intuition: 'DFS flood fill returning 1 + area of 4 neighbors, sinking land in-place.', pitfalls: 'Double counting cells without marking visited.', tc: 'O(M*N)', sc: 'O(M*N)', conf: 5, status: 'mastered' },
  { num: 733, title: 'Flood Fill', diff: 'Easy', cat: 'Phase 3: Graphs & BFS/DFS', prio: 2, intuition: 'Standard DFS/BFS starting at (sr, sc). Change matching initial color to newColor.', pitfalls: 'Infinite loop if newColor == originalColor (return early!).', tc: 'O(M*N)', sc: 'O(M*N)', conf: 5, status: 'mastered' },

  // Trie
  { num: 208, title: 'Implement Trie (Prefix Tree)', diff: 'Medium', cat: 'Phase 3: Trie', prio: 1, intuition: 'Node has Dictionary<char, TrieNode> (or TrieNode[26]) and bool isEnd.', pitfalls: 'Confusing Search (isEnd must be true) with StartsWith (any prefix matches).', tc: 'O(L)', sc: 'O(Total chars)', conf: 4, status: 'completed' },
  { num: 211, title: 'Design Add and Search Words Data Structure', diff: 'Medium', cat: 'Phase 3: Trie', prio: 2, intuition: 'Trie + DFS for wildcard \'.\' matching all non-null children.', pitfalls: 'Not handling wildcard recursion branch pruning.', tc: 'O(M) best, O(26^N) wildcard', sc: 'O(N)', conf: 3, status: 'in_progress' },

  // Backtracking
  { num: 17, title: 'Letter Combinations of a Phone Number', diff: 'Medium', cat: 'Phase 3: Backtracking', prio: 2, intuition: 'Digit-to-letter map. Recursive backtracking appending one character per digit index.', pitfalls: 'Empty string input should return empty list.', tc: 'O(4^N)', sc: 'O(N)', conf: 4, status: 'completed' },
  { num: 39, title: 'Combination Sum', diff: 'Medium', cat: 'Phase 3: Backtracking', prio: 1, intuition: 'Backtracking allowing candidate reuse: recurse on same index i; subtract candidate from remain.', pitfalls: 'Duplicate combinations if not ordering candidate selection.', tc: 'O(2^target)', sc: 'O(target)', conf: 4, status: 'completed' },
  { num: 46, title: 'Permutations', diff: 'Medium', cat: 'Phase 3: Backtracking', prio: 1, intuition: 'Backtracking with used[i] boolean array or swap in-place.', pitfalls: 'Adding same reference list to result without new List<int>(path).', tc: 'O(N * N!)', sc: 'O(N)', conf: 4, status: 'completed' },
  { num: 78, title: 'Subsets', diff: 'Medium', cat: 'Phase 3: Backtracking', prio: 1, intuition: 'At each index i, branch: include nums[i] or exclude nums[i] (2^N power set).', pitfalls: 'Adding mutable list reference instead of snapshot.', tc: 'O(N * 2^N)', sc: 'O(N)', conf: 5, status: 'mastered' },
  { num: 90, title: 'Subsets II', diff: 'Medium', cat: 'Phase 3: Backtracking', prio: 2, intuition: 'Sort array first. In for-loop, skip if (i > start && nums[i] == nums[i-1]) to avoid duplicate subsets.', pitfalls: 'Skipping duplicates across different recursion depths.', tc: 'O(N * 2^N)', sc: 'O(N)', conf: 4, status: 'completed' },
];

const dsaPhase4 = [
  // Dynamic Programming Essentials
  { num: 70, title: 'Climbing Stairs', diff: 'Easy', cat: 'Phase 4: Dynamic Programming', prio: 1, intuition: 'Fibonacci: dp[i] = dp[i-1] + dp[i-2]. O(1) state memory.', pitfalls: 'O(2^N) recursion without memoization.', tc: 'O(N)', sc: 'O(1)', conf: 5, status: 'mastered' },
  { num: 509, title: 'Fibonacci Number', diff: 'Easy', cat: 'Phase 4: Dynamic Programming', prio: 2, intuition: 'Iterative two-variable tabulation.', pitfalls: 'Recursion tree without memo.', tc: 'O(N)', sc: 'O(1)', conf: 5, status: 'mastered' },
  { num: 746, title: 'Min Cost Climbing Stairs', diff: 'Easy', cat: 'Phase 4: Dynamic Programming', prio: 2, intuition: 'dp[i] = cost[i] + Math.Min(dp[i-1], dp[i-2]).', pitfalls: 'Can start at index 0 or index 1.', tc: 'O(N)', sc: 'O(1)', conf: 5, status: 'mastered' },
  { num: 198, title: 'House Robber', diff: 'Medium', cat: 'Phase 4: Dynamic Programming', prio: 1, intuition: 'dp[i] = Math.Max(dp[i-1], dp[i-2] + nums[i]). Maintain rob1 and rob2.', pitfalls: 'Trying greedy (picking largest values fails on adjacent neighbors).', tc: 'O(N)', sc: 'O(1)', conf: 4, status: 'completed' },
  { num: 213, title: 'House Robber II', diff: 'Medium', cat: 'Phase 4: Dynamic Programming', prio: 2, intuition: 'Houses in circle: run House Robber on [0..n-2] and [1..n-1]. Take max.', pitfalls: 'Not handling single house edge case.', tc: 'O(N)', sc: 'O(1)', conf: 4, status: 'completed' },
  { num: 322, title: 'Coin Change', diff: 'Medium', cat: 'Phase 4: Dynamic Programming', prio: 1, intuition: 'Unbounded knapsack: dp[a] = min(dp[a], 1 + dp[a - coin]).', pitfalls: 'Greedy approach fails on arbitrary denominations.', tc: 'O(Amount * N)', sc: 'O(Amount)', conf: 4, status: 'completed' },
  { num: 300, title: 'Longest Increasing Subsequence', diff: 'Medium', cat: 'Phase 4: Dynamic Programming', prio: 1, intuition: 'Patience sorting / Binary search tail array in O(N log N).', pitfalls: 'O(N^2) DP is accepted but sub-optimal compared to O(N log N) tails.', tc: 'O(N log N)', sc: 'O(N)', conf: 3, status: 'in_progress' },
  { num: 416, title: 'Partition Equal Subset Sum', diff: 'Medium', cat: 'Phase 4: Dynamic Programming', prio: 1, intuition: '0/1 Knapsack: can subset sum equal totalSum / 2? If odd total, impossible.', pitfalls: 'Inner loop must run backwards to avoid using same element twice in 1D DP.', tc: 'O(N * Target)', sc: 'O(Target)', conf: 3, status: 'in_progress' },
  { num: 1143, title: 'Longest Common Subsequence', diff: 'Medium', cat: 'Phase 4: Dynamic Programming', prio: 1, intuition: '2D DP: if s1[i] == s2[j], 1 + dp[i-1, j-1]; else max(dp[i-1, j], dp[i, j-1]).', pitfalls: 'Off-by-one with (M+1) x (N+1) DP grid.', tc: 'O(M*N)', sc: 'O(M*N)', conf: 3, status: 'in_progress' },
  { num: 72, title: 'Edit Distance', diff: 'Medium', cat: 'Phase 4: Dynamic Programming', prio: 1, intuition: 'Levenshtein distance: insert, delete, replace. dp[i, j] = 1 + min(insert, delete, replace).', pitfalls: 'Base cases when one string is empty (costs equal remaining length).', tc: 'O(M*N)', sc: 'O(M*N)', conf: 3, status: 'in_progress' },
];

const dsaPhase5 = [
  // Hard Questions Worth Knowing
  { num: 42, title: 'Trapping Rain Water', diff: 'Hard', cat: 'Phase 5: Hard Questions', prio: 1, intuition: 'Two pointers with leftMax & rightMax. Bottleneck on shorter side determines water trapped.', pitfalls: 'Updating max values after adding water instead of before.', tc: 'O(N)', sc: 'O(1)', conf: 3, status: 'in_progress' },
  { num: 76, title: 'Minimum Window Substring', diff: 'Hard', cat: 'Phase 5: Hard Questions', prio: 1, intuition: 'Sliding window with have and need counters. Expand right, shrink left to minimize.', pitfalls: 'Character frequencies > 1; unicode edge cases.', tc: 'O(N+M)', sc: 'O(N+M)', conf: 2, status: 'pending' },
  { num: 84, title: 'Largest Rectangle in Histogram', diff: 'Hard', cat: 'Phase 5: Hard Questions', prio: 1, intuition: 'Monotonic increasing stack of indices. On shorter bar, pop and calculate area with popped height.', pitfalls: 'Width calculation: i - stack.Peek() - 1.', tc: 'O(N)', sc: 'O(N)', conf: 2, status: 'pending' },
  { num: 127, title: 'Word Ladder', diff: 'Hard', cat: 'Phase 5: Hard Questions', prio: 2, intuition: 'Bidirectional BFS from beginWord and endWord changing one character at a time.', pitfalls: 'Single-direction BFS exploring massive branching factors.', tc: 'O(N * M^2)', sc: 'O(N * M)', conf: 2, status: 'pending' },
  { num: 10, title: 'Regular Expression Matching', diff: 'Hard', cat: 'Phase 5: Hard Questions', prio: 3, intuition: 'DP table matching \'.\' and \'*\'. If \'*\' matches zero or more occurrences.', pitfalls: 'Empty string matching a*b* patterns.', tc: 'O(M*N)', sc: 'O(M*N)', conf: 2, status: 'pending' },
  { num: 32, title: 'Longest Valid Parentheses', diff: 'Hard', cat: 'Phase 5: Hard Questions', prio: 3, intuition: 'Stack storing indices, initialized with -1 as base for length calculation.', pitfalls: 'Matching count without boundary index baseline.', tc: 'O(N)', sc: 'O(N)', conf: 2, status: 'pending' },
  { num: 312, title: 'Burst Balloons', diff: 'Hard', cat: 'Phase 5: Hard Questions', prio: 3, intuition: 'Interval DP backwards: which balloon is popped LAST in interval [l, r]?', pitfalls: 'Top-down thinking which balloon popped first creates subproblems that depend on external neighbors.', tc: 'O(N^3)', sc: 'O(N^2)', conf: 1, status: 'pending' },
];

console.log(`Generated DSA Phase 1: ${dsaPhase1.length} questions`);
console.log(`Generated DSA Phase 2: ${dsaPhase2.length} questions`);
console.log(`Generated DSA Phase 3: ${dsaPhase3.length} questions`);
console.log(`Generated DSA Phase 4: ${dsaPhase4.length} questions`);
console.log(`Generated DSA Phase 5: ${dsaPhase5.length} questions`);

// Export helper to format DSA into SeedTopic
function convertDsa(d, dayOffset) {
  const slug = d.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return {
    id: `dsa-lc-${d.num}`,
    pillar: 'dsa',
    category: d.cat,
    title: `LC ${d.num}: ${d.title}`,
    slug: slug,
    difficulty: d.diff,
    priority: d.prio,
    day_target: dayOffset,
    external_url: `https://leetcode.com/problems/${slug}/`,
    summary: `LeetCode #${d.num} [${d.diff}] in ${d.cat}.`,
    key_intuition: d.intuition,
    pitfalls: d.pitfalls,
    notes: `### LC ${d.num}: ${d.title}\n- Category: ${d.cat}\n- Difficulty: ${d.diff}\n- Time Complexity: ${d.tc}\n- Space Complexity: ${d.sc}\n\n**Intuition:**\n${d.intuition}\n\n**Pitfalls:**\n${d.pitfalls}`,
    time_complexity: d.tc,
    space_complexity: d.sc,
    status: 'pending',
    confidence: 1, // 🌱 Level 1: Need Practice
    box: 1,
  };
}

module.exports = { dsaPhase1, dsaPhase2, dsaPhase3, dsaPhase4, dsaPhase5, convertDsa };
