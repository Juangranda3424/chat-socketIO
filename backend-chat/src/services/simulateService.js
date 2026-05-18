// Función auxiliar para simular trabajo de CPU
function calcularFibonacci(n) {
    if (n <= 1) return n;
    return calcularFibonacci(n - 1) + calcularFibonacci(n - 2);
}

export { calcularFibonacci };