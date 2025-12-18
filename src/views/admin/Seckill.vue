<template>
  <div class="admin-seckill">
    <el-card>
      <div class="header">
        <h2>秒杀商品管理</h2>
        <el-button type="primary" @click="showDialog = true">
          <el-icon><Plus /></el-icon>
          添加秒杀商品
        </el-button>
      </div>

      <el-table :data="products" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="productId" label="商品ID" width="100" />
        <el-table-column prop="seckillPrice" label="秒杀价" width="120">
          <template #default="{ row }">
            ¥{{ row.seckillPrice }}
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="总库存" width="100" />
        <el-table-column prop="availableStock" label="可用库存" width="120" />
        <el-table-column prop="startTime" label="开始时间" width="180" />
        <el-table-column prop="endTime" label="结束时间" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="editProduct(row)">编辑</el-button>
            <el-button
              link
              :type="row.status === 1 ? 'warning' : 'success'"
              @click="toggleStatus(row)"
            >
              {{ row.status === 1 ? '下架' : '上架' }}
            </el-button>
            <el-button
              link
              type="success"
              @click="handleWarmUp(row)"
              :disabled="row.status !== 1"
            >
              预热库存
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="showDialog"
      :title="editingProduct ? '编辑秒杀商品' : '添加秒杀商品'"
      width="600px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="商品ID" prop="productId">
          <el-input-number v-model="form.productId" :min="1" />
        </el-form-item>
        <el-form-item label="秒杀价" prop="seckillPrice">
          <el-input-number v-model="form.seckillPrice" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input-number v-model="form.stock" :min="1" />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
            v-model="form.startTime"
            type="datetime"
            placeholder="选择开始时间"
            value-format="YYYY-MM-DDTHH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker
            v-model="form.endTime"
            type="datetime"
            placeholder="选择结束时间"
            value-format="YYYY-MM-DDTHH:mm:ss"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import {
  getAdminSeckillList,
  addSeckillProduct,
  updateSeckillProduct,
  updateSeckillProductStatus
} from '@/api/admin'
import { warmUpStock } from '@/api/seckill'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const showDialog = ref(false)
const products = ref([])
const editingProduct = ref(null)
const formRef = ref()

const form = reactive({
  productId: null,
  seckillPrice: null,
  stock: null,
  startTime: '',
  endTime: ''
})

const rules = {
  productId: [{ required: true, message: '请输入商品ID', trigger: 'blur' }],
  seckillPrice: [{ required: true, message: '请输入秒杀价', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
}

const fetchProducts = async () => {
  loading.value = true
  try {
    const res = await getAdminSeckillList()
    products.value = res.data || []
  } catch (error) {
    ElMessage.error('获取商品列表失败')
  } finally {
    loading.value = false
  }
}

const editProduct = (product) => {
  editingProduct.value = product
  Object.assign(form, product)
  showDialog.value = true
}

const handleSubmit = async () => {
  await formRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      if (editingProduct.value) {
        await updateSeckillProduct(editingProduct.value.id, form)
        ElMessage.success('更新成功')
      } else {
        await addSeckillProduct(form)
        ElMessage.success('添加成功')
      }
      showDialog.value = false
      resetForm()
      fetchProducts()
    } catch (error) {
      console.error('操作失败:', error)
    }
  })
}

const toggleStatus = async (product) => {
  const newStatus = product.status === 1 ? 0 : 1
  try {
    await updateSeckillProductStatus(product.id, newStatus)
    ElMessage.success('状态更新成功')
    fetchProducts()
  } catch (error) {
    console.error('更新状态失败:', error)
  }
}

const getStatusType = (status) => {
  const types = { 0: 'info', 1: 'success', 2: 'danger' }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = { 0: '未开始', 1: '进行中', 2: '已结束' }
  return texts[status] || '未知'
}

const handleWarmUp = async (product) => {
  try {
    await warmUpStock(product.id)
    ElMessage.success('库存预热成功')
  } catch (error) {
    console.error('库存预热失败:', error)
  }
}

const resetForm = () => {
  editingProduct.value = null
  Object.assign(form, {
    productId: null,
    seckillPrice: null,
    stock: null,
    startTime: '',
    endTime: ''
  })
}

onMounted(() => {
  fetchProducts()
})
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header h2 {
  margin: 0;
}
</style>
