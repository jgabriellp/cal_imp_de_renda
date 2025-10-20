import { useState } from 'react';
import { Container, Row, Col, Form, Button, Table, Card } from 'react-bootstrap';

const faixasPadrao = [
  { ate: 22847.76, aliquota: 0 },
  { ate: 33919.80, aliquota: 0.075 },
  { ate: 45012.60, aliquota: 0.15 },
  { ate: 55976.16, aliquota: 0.225 },
  { ate: Infinity, aliquota: 0.275 },
];

const calcularImpostoProgressivo = (rendaTributavel, faixas) => {
  let restante = rendaTributavel;
  let limiteInferior = 0;
  const detalhes = [];
  let impostoTotal = 0;

  for (const faixa of faixas) {
    if (restante <= 0) break;
    const limiteSuperior = faixa.ate === Infinity ? Infinity : faixa.ate;
    const valorFaixa = Math.max(0, Math.min(limiteSuperior - limiteInferior, restante));
    const imposto = valorFaixa * faixa.aliquota;
    detalhes.push({ valorFaixa, aliquota: faixa.aliquota, imposto });
    impostoTotal += imposto;
    restante -= valorFaixa;
    limiteInferior = limiteSuperior;
  }

  return { impostoTotal, detalhes };
};

const App = () => {
  const [renda, setRenda] = useState('5000');
  const [ehMensal, setEhMensal] = useState(true);
  const [dependentes, setDependentes] = useState(0);
  const [outrasDeducoes, setOutrasDeducoes] = useState('0');
  const [faixas, setFaixas] = useState(faixasPadrao);
  const [usarFaixasExemplo, setUsarFaixasExemplo] = useState(true);

  const deducaoMensalDependente = 189.59;
  const taxaPrevidencia = 0.11;

  const converterNumero = (valor) => {
    const n = Number(String(valor).replace(/[^0-9.-]+/g, ''));
    return Number.isFinite(n) ? n : 0;
  };

  const calcular = () => {
    const rendaBruta = converterNumero(renda);
    const rendaAnual = ehMensal ? rendaBruta * 12 : rendaBruta;

    const deducaoDependentes = converterNumero(dependentes) * deducaoMensalDependente * 12;
    const previdencia = rendaAnual * taxaPrevidencia;
    const outras = converterNumero(outrasDeducoes);

    const totalDeducoes = deducaoDependentes + previdencia + outras;
    const rendaTributavel = Math.max(0, rendaAnual - totalDeducoes);

    const { impostoTotal, detalhes } = calcularImpostoProgressivo(rendaTributavel, faixas);

    return { rendaAnual, totalDeducoes, rendaTributavel, impostoTotal, detalhes };
  };

  const resultado = calcular();

  const formatarBRL = (valor) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <Container className="my-5">
      <Card className="shadow p-4">
        <h2 className="text-center mb-4">Calculadora de Imposto de Renda</h2>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Renda ({ehMensal ? 'mensal' : 'anual'})</Form.Label>
              <Form.Control
                value={renda}
                onChange={(e) => setRenda(e.target.value)}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>Tipo de renda</Form.Label>
              <div className="d-flex gap-2 mt-1">
                <Button
                  variant={ehMensal ? 'primary' : 'outline-primary'}
                  onClick={() => setEhMensal(true)}
                >
                  Mensal
                </Button>
                <Button
                  variant={!ehMensal ? 'primary' : 'outline-primary'}
                  onClick={() => setEhMensal(false)}
                >
                  Anual
                </Button>
              </div>
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Dependentes</Form.Label>
              <Form.Control
                type="number"
                min={0}
                value={dependentes}
                onChange={(e) => setDependentes(e.target.value)}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>Outras deduções (anual)</Form.Label>
              <Form.Control
                value={outrasDeducoes}
                onChange={(e) => setOutrasDeducoes(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Check
          type="checkbox"
          id="faixasExemplo"
          label="Usar faixas de exemplo (padrão)"
          checked={usarFaixasExemplo}
          onChange={(e) => setUsarFaixasExemplo(e.target.checked)}
          className="mb-4"
        />

        <Card className="mb-4 p-3">
          <h5>Resumo</h5>
          <Row>
            <Col md={6}><p>Renda anual: <strong>{formatarBRL(resultado.rendaAnual)}</strong></p></Col>
            <Col md={6}><p>Deduções totais: <strong>{formatarBRL(resultado.totalDeducoes)}</strong></p></Col>
            <Col md={6}><p>Base tributável: <strong>{formatarBRL(resultado.rendaTributavel)}</strong></p></Col>
            <Col md={6}><p>Imposto estimado: <strong>{formatarBRL(resultado.impostoTotal)}</strong></p></Col>
          </Row>
        </Card>

        <h5 className="mb-3">Detalhamento por faixa</h5>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Valor na faixa</th>
              <th>Alíquota</th>
              <th>Imposto</th>
            </tr>
          </thead>
          <tbody>
            {resultado.detalhes.map((faixa, i) => (
              <tr key={i}>
                <td>{formatarBRL(faixa.valorFaixa)}</td>
                <td>{(faixa.aliquota * 100).toFixed(2)}%</td>
                <td>{formatarBRL(faixa.imposto)}</td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Card className="p-3 mt-4 bg-light">
          <h6>Observações:</h6>
          <ul>
            <li>As faixas e deduções usadas aqui são apenas exemplos.</li>
            <li>Você pode adicionar exportação, histórico ou integração com backend.</li>
          </ul>
        </Card>
      </Card>
    </Container>
  );
};

export default App;
