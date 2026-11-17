import weka.core.converters.ConverterUtils.DataSource;

public class TestArff {
    public static void main(String[] args) {
        try {
            DataSource source = new DataSource("dataset/arff/query.arff");
            source.getDataSet();
            System.out.println("Loaded successfully!");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
