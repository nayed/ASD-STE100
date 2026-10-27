int *bad(void) {
    int x = 5;
    return &x;            /* x dies when bad() returns */
}
