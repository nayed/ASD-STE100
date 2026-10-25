/**
 * Every listing and every output of MEM-100. The outputs are real: each program was compiled
 * and run on x86-64 Debian Linux with GCC 16.2 and Go 1.27 on 2026-10-24, and pasted unchanged,
 * except where a line says "…" (lines left out) or where a long path was shortened by
 * ASAN_OPTIONS=strip_path_prefix.
 */

import type { TermLine } from "./chrome";

export const WHERE_C = `#include <stdio.h>
#include <stdlib.h>

int initialized = 42;   /* data: a global with a value */
int zeroed;             /* bss: a global without a value */

int main(void) {
    int local = 7;                      /* stack */
    int *small = malloc(sizeof(int));   /* heap */
    char *large = malloc(1 << 20);      /* 1 MiB: its own mapping */

    printf("text    main()       %p\\n", (void *)main);
    printf("data    initialized  %p\\n", (void *)&initialized);
    printf("bss     zeroed       %p\\n", (void *)&zeroed);
    printf("heap    small        %p\\n", (void *)small);
    printf("mapped  large        %p\\n", (void *)large);
    printf("lib     printf()     %p\\n", (void *)printf);
    printf("stack   local        %p\\n", (void *)&local);

    free(large);
    free(small);
    return local - 7;
}`;

/** run 1 feeds Fig. 01 */
export const WHERE_RUN1 = {
  text: "0x5589c9dc7149",
  data: "0x5589c9dca020",
  bss: "0x5589c9dca028",
  heap: "0x5589d9745010",
  mapped: "0x7f96f3e68010",
  lib: "0x7f96f3fc6dc0",
  stack: "0x7ffd5324c22c",
};

export const WHERE_OUT: TermLine[] = [
  { t: "gcc -Wall -Wextra -o where where.c", k: "cmd" },
  { t: "./where", k: "cmd" },
  { t: "text    main()       0x5589c9dc7149" },
  { t: "data    initialized  0x5589c9dca020" },
  { t: "bss     zeroed       0x5589c9dca028" },
  { t: "heap    small        0x5589d9745010" },
  { t: "mapped  large        0x7f96f3e68010" },
  { t: "lib     printf()     0x7f96f3fc6dc0" },
  { t: "stack   local        0x7ffd5324c22c" },
  { t: "./where", k: "cmd" },
  { t: "# second run: every region moves", k: "com" },
  { t: "text    main()       0x55d6bf11c149" },
  { t: "data    initialized  0x55d6bf11f020" },
  { t: "bss     zeroed       0x55d6bf11f028" },
  { t: "heap    small        0x55d6dd096010" },
  { t: "mapped  large        0x7f41dd56f010" },
  { t: "lib     printf()     0x7f41dd6cddc0" },
  { t: "stack   local        0x7ffd5c0fe2fc" },
];

export const COUNTER_C = `#include <stdlib.h>

int *make_counter(int start) {
    int *p = malloc(sizeof(int));   /* heap */
    *p = start;
    return p;
}

int main(void) {
    int step = 2;                   /* stack */
    int *c = make_counter(10);
    *c += step;
    free(c);                        /* give back */
    return 0;
}`;

/**
 * Real addresses of one run of counter.c (with print statements added, -O0).
 * main: rbp 0x7ffd32f1a3d0, step at rbp-4, c at rbp-16, rsp 0x7ffd32f1a3c0.
 * make_counter: rbp 0x7ffd32f1a3b0, p at rbp-8, start at rbp-20, rsp 0x7ffd32f1a390.
 * The heap block: 0x55e742104020.
 */
export const RUN = {
  caller_rsp: "0x7ffd32f1a3e0",
  main_rbp: "0x7ffd32f1a3d0",
  main_rsp: "0x7ffd32f1a3c0",
  mc_rbp: "0x7ffd32f1a3b0",
  mc_rsp: "0x7ffd32f1a390",
  block: "0x55e742104020",
};

export const FRAME_ASM: TermLine[] = [
  { t: "gcc -O0 -S -masm=intel -fno-asynchronous-unwind-tables counter.c", k: "cmd" },
  { t: "# prints nothing: -S writes the machine code to counter.s instead of building a program", k: "com" },
  { t: "sed -n '/^\"make_counter\":/,/ret/p' counter.s", k: "cmd" },
  { t: '"make_counter":' },
  { t: "\tpush\trbp", k: "hot" },
  { t: "\tmov\trbp, rsp" },
  { t: "\tsub\trsp, 32", k: "hot" },
  { t: "\tmov\tDWORD PTR -20[rbp], edi" },
  { t: "\tmov\tedi, 4" },
  { t: '\tcall\t"malloc"@PLT' },
  { t: "\tmov\tQWORD PTR -8[rbp], rax" },
  { t: "\tmov\trax, QWORD PTR -8[rbp]" },
  { t: "\tmov\tedx, DWORD PTR -20[rbp]" },
  { t: "\tmov\tDWORD PTR [rax], edx" },
  { t: "\tmov\trax, QWORD PTR -8[rbp]" },
  { t: "\tleave" },
  { t: "\tret" },
];

export const GO_MAIN = `package main

import "fmt"

type point struct{ x, y int }

// p stays inside the function: the compiler keeps it on the stack
func sum() int {
	p := point{1, 2}
	return p.x + p.y
}

// the address of p leaves the function: p must live on the heap
func newPoint() *point {
	p := point{3, 4}
	return &p
}

func main() {
	fmt.Println(sum(), *newPoint())
}`;

export const GO_OUT: TermLine[] = [
  { t: "go build -gcflags=-m .", k: "cmd" },
  { t: "# esc" },
  { t: "./main.go:8:6: can inline sum" },
  { t: "./main.go:14:6: can inline newPoint" },
  { t: "./main.go:20:17: inlining call to sum" },
  { t: "./main.go:20:30: inlining call to newPoint" },
  { t: "./main.go:20:13: inlining call to fmt.Println" },
  { t: "./main.go:15:2: moved to heap: p", k: "hot" },
  { t: "./main.go:20:13: ... argument does not escape" },
  { t: "./main.go:20:17: ~r0 escapes to heap" },
  { t: "./main.go:20:21: *(~r0) escapes to heap" },
  { t: "go run .", k: "cmd" },
  { t: "3 {3 4}" },
];

export const ALLOC_C = `#include <stdlib.h>

void use(char *buf);

void on_stack(void) {
    char buf[4096];           /* stack: one subtraction */
    use(buf);
}

void on_heap(void) {
    char *buf = malloc(4096); /* heap: a call into the allocator */
    use(buf);
    free(buf);
}`;

export const ALLOC_ASM: TermLine[] = [
  { t: "gcc -O2 -S -masm=intel -fno-asynchronous-unwind-tables alloc.c", k: "cmd" },
  { t: "# prints nothing: the machine code goes to alloc.s", k: "com" },
  { t: "sed -n '/^\"on_stack\":/,/ret/p;/^\"on_heap\":/,/jmp/p' alloc.s", k: "cmd" },
  { t: '"on_stack":' },
  { t: "\tsub\trsp, 4104", k: "hot" },
  { t: "\tmov\trdi, rsp" },
  { t: '\tcall\t"use"@PLT' },
  { t: "\tadd\trsp, 4104", k: "hot" },
  { t: "\tret" },
  { t: '"on_heap":' },
  { t: "\tpush\trbx" },
  { t: "\tmov\tedi, 4096" },
  { t: '\tcall\t"malloc"@PLT', k: "hot" },
  { t: "\tmov\trbx, rax" },
  { t: "\tmov\trdi, rax" },
  { t: '\tcall\t"use"@PLT' },
  { t: "\tmov\trdi, rbx" },
  { t: "\tpop\trbx" },
  { t: '\tjmp\t"free"@PLT', k: "hot" },
];

export const DOWN_C = `#include <stdio.h>

static long down(long n) {
    if (n % 50000 == 0)
        printf("depth %ld\\n", n);
    return down(n + 1) + 1;   /* no end: each call adds a frame */
}

int main(void) {
    return (int)down(1);
}`;

export const DOWN_OUT: TermLine[] = [
  { t: "ulimit -s", k: "cmd" },
  { t: "8192" },
  { t: "gcc -O0 -o down down.c", k: "cmd" },
  { t: "./down", k: "cmd" },
  { t: "depth 50000" },
  { t: "depth 100000" },
  { t: "depth 150000" },
  { t: "depth 200000" },
  { t: "depth 250000" },
  { t: "Segmentation fault         ./down", k: "hot" },
  { t: "echo $?", k: "cmd" },
  { t: "139" },
];

export const UAF_C = `#include <stdlib.h>

int main(void) {
    int *p = malloc(sizeof(int));
    *p = 1;
    free(p);
    return *p;            /* use after free */
}`;

export const UAF_OUT: TermLine[] = [
  { t: "gcc -g -fsanitize=address -o uaf uaf.c && ./uaf", k: "cmd" },
  { t: "=================================================================" },
  { t: "==184231==ERROR: AddressSanitizer: heap-use-after-free on address 0x7b751f7e0010 at pc 0x55fa2ffa6223 bp 0x7ffddba960c0 sp 0x7ffddba960b8", k: "hot" },
  { t: "READ of size 4 at 0x7b751f7e0010 thread T0" },
  { t: "    #0 0x55fa2ffa6222 in main uaf.c:7" },
  { t: "    …", k: "omit" },
  { t: "0x7b751f7e0010 is located 0 bytes inside of 4-byte region [0x7b751f7e0010,0x7b751f7e0014)" },
  { t: "freed by thread T0 here:" },
  { t: "    #0 0x7f552072340f in free ../../../../src/libsanitizer/asan/asan_malloc_linux.cpp:51" },
  { t: "    #1 0x55fa2ffa61eb in main uaf.c:6" },
  { t: "    …", k: "omit" },
  { t: "previously allocated by thread T0 here:" },
  { t: "    #0 0x7f552072435f in malloc ../../../../src/libsanitizer/asan/asan_malloc_linux.cpp:67" },
  { t: "    #1 0x55fa2ffa619a in main uaf.c:4" },
  { t: "    …", k: "omit" },
];

export const LEAK_C = `#include <stdlib.h>

int main(void) {
    int *p = malloc(4 * sizeof(int));
    p[0] = 1;
    p = NULL;             /* the only pointer is lost */
    return 0;
}`;

export const LEAK_OUT: TermLine[] = [
  { t: "gcc -g -fsanitize=address -o leak leak.c && ./leak", k: "cmd" },
  { t: "=================================================================" },
  { t: "==184233==ERROR: LeakSanitizer: detected memory leaks", k: "hot" },
  { t: "" },
  { t: "Direct leak of 16 byte(s) in 1 object(s) allocated from:" },
  { t: "    #0 0x7f44e552435f in malloc ../../../../src/libsanitizer/asan/asan_malloc_linux.cpp:67" },
  { t: "    #1 0x55cf81e6317a in main leak.c:4" },
  { t: "    …", k: "omit" },
];

export const LOCAL_C = `int *bad(void) {
    int x = 5;
    return &x;            /* x dies when bad() returns */
}`;

export const LOCAL_OUT: TermLine[] = [
  { t: "gcc -c -Wall local.c", k: "cmd" },
  { t: "local.c: In function ‘bad’:" },
  { t: "local.c:3:12: warning: function returns address of local variable [-Wreturn-local-addr]", k: "hot" },
  { t: "    3 |     return &x;            /* x dies when bad() returns */" },
  { t: "      |            ^~" },
];

/** the cover specimen: hexdump -C of the title, 58 bytes */
export const DUMP = [
  ["00000000", "53 54 41 43 4b 20 26 20  48 45 41 50 0a 57 48 45", "|STACK & HEAP.WHE|"],
  ["00000010", "52 45 20 41 20 50 52 4f  47 52 41 4d 20 4b 45 45", "|RE A PROGRAM KEE|"],
  ["00000020", "50 53 20 49 54 53 20 44  41 54 41 0a 4d 45 4d 2d", "|PS ITS DATA.MEM-|"],
  ["00000030", "31 30 30 20 52 45 56 20  41 0a", "|100 REV A.|"],
  ["0000003a", "", ""],
];
